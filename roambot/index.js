/**
 * roambot.js
 */

'use strict';

var fs = require('fs');
var Promise = require('bluebird');
var retry = require('bluebird-retry');
var sv = require('./streetview');
var twitter =  require('./config/twitter');

var service = {
	tweet: tweet
};

// Callback functions
var error = function(err) {
	console.log(err);
};
var success = function(res) {
	console.log(JSON.parse(res));
};

// Create package.json
// Host server and start tweeting with interval
// Allow city requests via streaming api (must consider api limits, can create lookup object of cities for this)

//var cities = JSON.parse(fs.readFileSync( './roambot/worldcitiespop_streetview.txt', { encoding: 'utf8' }));
var countries = JSON.parse(fs.readFileSync( './roambot/worldcitiespop_countrysort.txt', { encoding: 'utf8' }));
var countriesKeys = Object.keys(countries);

// clean up page putting each function into own function and chaining.
function tweet() {
	var city = getRandomCity(); // randomly choose a city
	
	// Attempt to get street view from city, and retry up to 50 times
	retry(attemptStreetView.bind(this, city.Bounds), { max_tries: 50 }).then(function(query) {
		sv.getStreetView(query).then(function(res) {
			// fs.writeFile('./temp.jpg', new Buffer(res.body, 'base64'), function(err) {}); // saves image to file
			var image = res.body;
			twitter.postMedia({ media_data: new Buffer(image).toString('base64') }, error, function(res) {
				var coords = query.location.split(',');
				var media_id = JSON.parse(res).media_id_string;
				twitter.getCustomApiCall('/geo/reverse_geocode.json',{ lat: coords[0], long: coords[1]}, error, function(res) {
					var geoData = JSON.parse(res), twitterPlace = chooseTwitterPlace(geoData.result.places);
					var params = {
						status: formatAddress(twitterPlace.address || city.Address),
						place_id: twitterPlace.id || '',
						media_ids: media_id
					};
					twitter.postTweet(params, error, success);
				});	
			});
		}, error);	
	}, error);
}

function getRandomCity() {
	var country, cities, city;
	
	country = countriesKeys[getRandomInt(0, countriesKeys.length)];
	cities = countries[country];
	city = cities[getRandomInt(0, cities.length)];
	
	return city;	
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

// Prioritizes specific geocode data from Twitter with fallback to less specific data from original file
function buildStatus() {
	
}


// Removes location duplication in address that sometimes occurs
function formatAddress(address) {
	var unique = address.split(',').filter(function(item, pos, self) {
		return self.indexOf(item) === pos;
	});
	
	return unique.join(',');
}

// Returns a random integer between min (included) and max (excluded)
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = service;