/**
 * twitter.js
 */

 'use strict';

var Twitter = require('twitter'),
	config = {
		consumer_key: process.env.PAINTERBOT_CONSUMER_KEY,
		consumer_secret: process.env.PAINTERBOT_CONSUMER_SECRET,
		access_token_key: process.env.PAINTERBOT_ACCESS_TOKEN,
		access_token_secret: process.env.PAINTERBOT_ACCESS_TOKEN_SECRET
	};

var twitter = new Twitter(config);

module.exports = twitter;