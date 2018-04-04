/**
 * datafilter.js: filters worldcitiespop.txt
 * Original dataset: https://www.maxmind.com/en/free-world-cities-database
 */

'use strict';

var fs = require('fs'); 
var parse = require('csv-parse');
var request = require('superagent');
var Promise = require('bluebird');
var sv = require('./streetview');

// set filter values
var dataFile = './worldcitiespop.txt';

var minPopulation = 999999;
var minSuccessRate = 0.15;

// run filters
// WARNING: Some of these filters use and surpass API usage limits, be careful when using.
// filterByPopulation(5000, dataFile, 'cities_minpop_1');
// addGeocodeData();
// filterByStreetView();
// sortByCountry();

// Filter original dataset by minimum population
function filterByPopulation(minPopulation, inputFile, outputFile) {
	var output = [];
	
	var parserOptions = {
			columns: true, 
			relax: true,
			relax_column_count: true, 
			skip_empty_lines: true,
			trim: true,
			auto_parse: true
	}, parser = parse(parserOptions);

	// example: http://stackoverflow.com/a/37182426
	fs.createReadStream(inputFile)
		.pipe(parser)
		.on('data', function(row) {
			if(row.Population && row.Population > minPopulation) {
				console.log(row);
				output.push(row);
			}
		})
		.on('end', function() {
			// console.log(JSON.stringify(output));
			fs.writeFileSync(outputFile, JSON.stringify(output));
			console.log('Found ' + output.length + ' cities with population over ' + minPopulation);
		});
}

// Add data from Google Maps Geocoding API for each city
// https://developers.google.com/maps/documentation/geocoding/start
function addGeocodeData() {
	var inputFile = './worldcitiespop_filteredByPop.txt', output = [], outputFile = './worldcitiespop_geocode.txt';
	var cities = JSON.parse(fs.readFileSync(inputFile, { encoding: 'utf8' }));

	// use Promise.each for sequential requests to prevent rate limiting
	Promise.each(cities, function(city, i) {
		var address = city.City + ',' + city.Country;
		
		return request
				.get('https://maps.googleapis.com/maps/api/geocode/json')
				.query({ address: address, key: process.env.GOOGLE_GEOCODE_KEY })
				.then(function(res, err) {
					var viewport = res.body.results[0].geometry.viewport;
					var fmtAddress = res.body.results[0].formatted_address;
					var bounds = {
						north: viewport.northeast.lng,
						south: viewport.southwest.lng,
						east: viewport.northeast.lat,
						west: viewport.southwest.lat
					};
					
					console.log(i);
					console.log(address);
					console.log(fmtAddress);
					
					city.Address = fmtAddress;
					city.Bounds = bounds;
					output.push(city);
				});			
	}).then(function() {
		// console.log(JSON.stringify(output));
		fs.writeFileSync(outputFile, JSON.stringify(output));
		console.log('Added geocoding data to ' + output.length + ' cities');
	});
}

// Filter geocode dataset for cities that return street views at least 25 percent of the time
// WARNING: This function well exceeds the daily API usage limit (and should only need to be run once) 
// https://developers.google.com/maps/documentation/streetview/metadata
function filterByStreetView() {
	var inputFile = './worldcitiespop_geocode.txt', output = [], outputFile = './worldcitiespop_streetview.txt';
	var cities = JSON.parse(fs.readFileSync(inputFile, { encoding: 'utf8' }));
	
	var reqs = [];
	for(var i = 0; i < cities.length; i++) { // for each city
		var tests = [];
		for(var j = 0; j < 50; j++) {	// repeat 50 times
			var query = sv.getRandomQuery(cities[i].Bounds);
			var test = sv.testStreetView(query);	
			tests.push(test);
		}

		var req = getSuccessRate(cities[i], tests).then(function(city) {
			if(city) { output.push(city); }
		});
		
		reqs.push(req);
	}
		
	Promise.all(reqs).then(function() {
		// console.log(JSON.stringify(output));
		fs.writeFileSync(outputFile, JSON.stringify(output));
		console.log('Found ' + output.length + ' cities with street view success rate over ' + minSuccessRate);
	});
}

function getSuccessRate(city, tests) {
	var success = 0, failure = 0, successRate;
	return Promise.each(tests, function() { console.log( 'Completed ' + city.City) }).then(function(results)  {
		for(var i = 0; i < results.length; i++) {
			if(results[i].body.location) {
				success++;
			} else if(results[i].body.status === 'ZERO_RESULTS') {
				failure++;
			}
		}
		
		successRate = success / (success + failure);
		
		console.log(city.City);
		console.log('Success: ' + success);
		console.log('Failure: ' + failure);
		console.log('Success Rate: ' + successRate);
		
		if(successRate > minSuccessRate) {
			return Promise.resolve(city);
		}
		
		return Promise.resolve(false);
	});
}

function sortByCountry() {
	var inputFile = './worldcitiespop_streetview.txt', output = {}, outputFile = './worldcitiespop_countrysort.txt';
	var cities = JSON.parse(fs.readFileSync(inputFile, { encoding: 'utf8' }));
	
	var outputCount = 0;
	for(var i = 0; i < cities.length; i++) {
		var country = cities[i].Country;
		
		if(!output[country]) {
			output[country] = [];
			outputCount++;
		}
		
		output[country].push(cities[i]);
	}
	
	// console.log(JSON.stringify(output));
	fs.writeFileSync(outputFile, JSON.stringify(output));
	console.log('Sorted ' + cities.length + ' cities into ' + outputCount + ' countries');
}