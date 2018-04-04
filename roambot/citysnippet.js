/**
 * citysnippet.js
 */

'use strict';

var request = require('superagent');
//var htmlparser = require("htmlparser2");
var cheerio = require('cheerio');

const maxLength = 140;

var service = {
	getSnippet: getSnippet
};

// err functions!
// arrow notation to clean this up?
// put api address up top here and in streetview (link to docs)
function getSnippet(city) {
	var pageQuery = {
		action: 'query',
		generator: 'search',
		gsrsearch: city,
		gsrlimit: 1,
		redirects: true,
		format: 'json'
	};
	
	return request
		.get('https://en.wikipedia.org/w/api.php')
		.query(pageQuery).then(function(res) {
			var pages = res.body.query.pages;
			var pageId = pages[Object.keys(pages)[0]].pageid;
			
			var textQuery = {
				action: 'query',
				prop: 'extracts',
				//explaintext: true,
				//exsectionformat: 'plain',
				pageids: pageId,
				redirects: true,
				format: 'json'
			};
			
			return request
				.get('https://en.wikipedia.org/w/api.php')
				.query(textQuery).then(function(res) {
					var page = res.body.query.pages;
					var content = page[Object.keys(pages)[0]].extract;
					
					var $ = cheerio.load(content);
					
					// remove any ps before list
					var paragraphs = $('p').text().split('. ');
					
					var snippet = paragraphs[getRandomInt(0, paragraphs.length)];
					var cityName = city.split(',')[0];
					var capitalized = cityName[0].toUpperCase() + cityName.substring(1);
					
					var charsLeft = maxLength - city.length;
					
					var firstWord = false;
					while(!firstWord) {
						snippet = paragraphs[getRandomInt(0, paragraphs.length)];
						console.log(capitalized);
						if(snippet.indexOf(capitalized) === 0) {
							console.log(snippet);
							firstWord = true;
						}
					}
					
					/*if(snippet.length < charsLeft) {
						console.log(snippet);
					}*/
					
					// if contains brussels. and if ends with period and starts with capitol.
					//var sentences = text.replace('\n', ' ').split('.');
					//console.log(sentences[getRandomInt(0, sentences.length)]);
				});
				
				// possibly use the library to only get p tags
			
		});
}

// Returns a random integer between min (included) and max (excluded)
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = service;