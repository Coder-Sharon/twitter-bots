/**
 * roambot.js
 */

 'use strict';
 
/*var Twitter = require('twitter-node-client').Twitter,
	config = {
		consumerKey: process.env.ROAMBOT_CONSUMER_KEY,
		consumerSecret: process.env.ROAMBOT_CONSUMER_SECRET,
		accessToken: process.env.ROAMBOT_ACCESS_TOKEN,
		accessTokenSecret: process.env.ROAMBOT_ACCESS_TOKEN_SECRET
	};
	
var twitter = new Twitter(config);*/

var Twitter = require('twitter'),
	config = {
		consumer_key: process.env.ROAMBOT_CONSUMER_KEY,
		consumer_secret: process.env.ROAMBOT_CONSUMER_SECRET,
		access_token_key: process.env.ROAMBOT_ACCESS_TOKEN,
		access_token_secret: process.env.ROAMBOT_ACCESS_TOKEN_SECRET
	};

var twitter = new Twitter(config);

module.exports = twitter;