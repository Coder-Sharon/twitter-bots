/**
 * roambot.js
 */

'use strict';

var fs = require('fs');
var Promise = require('bluebird');
var retry = require('bluebird-retry');
var sv = require('./streetview');
var twitter =  require('./config/twitter');
var store = require('./config/store');

/*
* TO-DO:
* Consider api limits
* Mongo
* Sorry I didn't find 'insert place here, i think you meant...' for close typos?
*/

var service = {
	launch: launch
};

// Callback functions
var error = function(err) {
	console.log(err);
};
var success = function(res) {
	console.log(JSON.parse(res));
};

function launch() {
	initStream();
	//var roambot = setInterval(roambot.tweet, 600000); //clear interval?
	setInterval(tweet, 1000); //clear interval?
}

function initStream() {
	twitter.stream('user', { replies: 'all' }, function(stream) {
		stream.on('data', function(tweet) {
			store.tweets.unshift(tweet);
		});
			
		stream.on('error', function(error) {
			throw error;
		});
	});
}

function tweet() {
	var tweet = store.tweets.pop();
	
	if(!tweet) {
		return;
	}
	
	var address = parseAddress(tweet);
	var bounds = sv.getGeocodeData(address).then(function(res, err) {
		// set error checking
		var viewport = res.body.results[0].geometry.viewport;
		var city = {
			address: address,
			bounds: getBounds(viewport)
		};
		
		generateTweet(city);
	
	});
}

function parseAddress(tweet) {
	return tweet.text.replace('@roambot', '').trim();
}

function getBounds(viewport) {
	var bounds = {
		north: viewport.northeast.lng,
		south: viewport.southwest.lng,
		east: viewport.northeast.lat,
		west: viewport.southwest.lat
	};
	
	return bounds;
}

// err checking!
// clean up page putting each function into own function and chaining.
// get link for google maps
// remove twitter location part.
function generateTweet(city) {
	// Attempt to get street view from city, and retry up to 50 times
	retry(attemptStreetView.bind(this, city.bounds), { max_tries: 50 }).then(function(query) {
		sv.getStreetView(query).then(function(res) {
			var image = res.body;
			twitter.post('media/upload', { media_data: new Buffer(image).toString('base64') }, function(err, res) {
				var coords = query.location.split(',');
				var media_id = res.media_id_string;
				twitter.get('/geo/reverse_geocode.json',{ lat: coords[0], long: coords[1] }, function(err, res) {
					var twitterPlace = chooseTwitterPlace(res.result.places);
					var params = {
						status: formatAddress(twitterPlace.address || city.address),
						place_id: twitterPlace.id || '',
						media_ids: media_id
					};
					twitter.post('statuses/update', params, function(err, res) {
						console.log(res);
					});
				});	
			});
		}, error);	
	}, error);
}

function attemptStreetView(bounds) {
	var query = sv.getRandomQuery(bounds);
	return sv.testStreetView(query).then(function(res) {
		if(res.body.location) {
			return Promise.resolve(query);
		} else {
			return Promise.reject(new Error('Failed to get a street view'));
		}
	});
}

// Chooses most specific geocode information from twitter about the location
// https://dev.twitter.com/overview/api/places
function chooseTwitterPlace(places) {
	var lookup = {};
	for(var i = 0; i < places.length; i++) {
		lookup[places[i].place_type] = places[i];
	} 
	
	var place = lookup.neighborhood || lookup.city;
	var result = place ? { address: place.full_name + ', ' + place.country, id: place.id } : {};
	
	return result;
}

// Removes location duplication in address that sometimes occurs
function formatAddress(address) {
	var unique = address.split(',').filter(function(item, pos, self) {
		return self.indexOf(item) === pos;
	});
	
	return unique.join(',');
}

module.exports = service;