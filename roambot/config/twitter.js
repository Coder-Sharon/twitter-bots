/**
 * roambot.js
 */

 'use strict';
 
var Twitter = require('twitter-node-client').Twitter,
	config = {
		consumerKey: process.env.ROAMBOT_CONSUMER_KEY,
		consumerSecret: process.env.ROAMBOT_CONSUMER_SECRET,
		accessToken: process.env.ROAMBOT_ACCESS_TOKEN,
		accessTokenSecret: process.env.ROAMBOT_ACCESS_TOKEN_SECRET
	};
	
var twitter = new Twitter(config);

module.exports = twitter;