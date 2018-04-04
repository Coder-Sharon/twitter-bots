/**
 * painterbot
 */

'use strict';
// draw based on images for inspiration!!!
var fs = require('fs');
var canvas = require('pureimage');	
var twitter = require('./config/twitter');

var service = {
	launch: launch
};

function launch() {
	//var roambot = setInterval(roambot.tweet, 600000); //clear interval?
	setInterval(tweet, 1000); //clear interval?
}

function tweet() {
	/*twitter.post('statuses/update', {status: content}, function(err, res) {
		console.log(res);
	});*/
	generateTweet();
}

var w = 800, h = 600;
var img = canvas.make(w,h);
var ctx = img.getContext('2d');

// select and set random rgb
var initRGB = selectRandomRGB(true);
ctx.fillStyle = getRGBAString(initRGB);

// select light to adjust
var adjustLight = selectAdjustment();

function generateTweet() {
	// paint image
	for(var i = 0; i < w; i++) {
		varyBy(i, getRandomVariation());
		for(var j = 0; j < h; j++) {
			varyBy(j, getRandomVariation());
			ctx.fillRect(i,j,2,2);
		}
	}

	// save image
	//canvas.encodePNG(img, fs.createWriteStream('out.png'), function(err) {
		//console.log("wrote out the png file to out.png");
		twitter.post('media/upload', { media_data: new Buffer(img.data).toString('base64')  }, function(err, res) {
				console.log(new Buffer(img.data).toString('base64'));
			var media_id = res.media_id_string;
			console.log(media_id);
			var params = {
				status:"test", //random word
				media_ids: media_id
			};
			twitter.post('statuses/update', params, function(err, res) {
				console.log(res);
			});
		});
	//});
}

function getRGBAString(rgb) {
	return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',1)';
}

function selectRandomRGB(init) {
	var keys;
	if(init || adjustLight === 'all') {
		keys = ['r', 'g', 'b'];
	} else {
		keys = [adjustLight];
	}
	
	var rgb = initRGB || {};
	keys.forEach(function(key) {
		rgb[key] = getRandomIntInclusive(0, 255);
	});

	return rgb;
}

function selectAdjustment() {
	var r = getRandomIntInclusive(0, 3);
	switch(r) {
		case 0: return 'all';
		case 1: return 'r';
		case 2: return 'g';
		case 3: return 'b';
	}
}

function varyBy(val, num) {
	if(!(val % num) && coinFlip()) {
			ctx.fillStyle = getRGBAString(selectRandomRGB());
	}
}

function getRandomVariation() {
	var variation = getRandomIntInclusive(0, 10);
	if(coinFlip()) {
		variation *= 10;
	} 
	return variation;
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// skew coin flip?
function coinFlip() {
    return Math.floor(Math.random() * 2);
}

module.exports = service;