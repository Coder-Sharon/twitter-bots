/**
 * streetview.js
 */

'use strict';

var request = require('superagent');

var service = {
	getRandomQuery: getRandomQuery,
	testStreetView: testStreetView,
	getStreetView: getStreetView
};

function getRandomQuery(bounds) {
	var query = {
		size: '640x480',
		location: getRandomLocation(bounds),
		heading: getRandomInt(0, 360),
		fov: getRandomInt(90, 120),
		pitch: getRandomInt(-25, 25),
		key: process.env.GOOGLE_STREETVIEW_KEY
	};
	
	return query;
}

function testStreetView(query) {
	return request
		.get('https://maps.googleapis.com/maps/api/streetview/metadata')
		.query(query);	
}

function getStreetView(query) {
		return request
			.get('https://maps.googleapis.com/maps/api/streetview')
			.query(query);
}

// Randomizes location based on bounding box
function getRandomLocation(bounds) {
	var minLat, maxLat, minLong, maxLong;
	var randomLat, randomLong, randomLocation;
	
	if(bounds.west < bounds.east) {
		minLat = bounds.west, maxLat = bounds.east;
	} else {
		minLat = bounds.east, maxLat = bounds.west;
	}
	
	if(bounds.south < bounds.north) {
		minLong = bounds.south, maxLong = bounds.north;
	} else {
		minLong = bounds.north, maxLong = bounds.south;
	}
	
	randomLat = getRandomyDecimal(minLat, maxLat);
	randomLong = getRandomyDecimal(minLong, maxLong);
	randomLocation = randomLat + ',' + randomLong;
	
	return randomLocation;
}

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomyDecimal(min, max) {
	return Math.random() * (max - min) + min;
}

// Returns a random integer between min (included) and max (included)
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = service;