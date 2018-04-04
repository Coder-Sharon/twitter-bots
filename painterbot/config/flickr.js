/**
 * flickr.js
 */

 'use strict';

var Flickr = require("node-flickr"),
    config = {
		api_key: process.env.FLICKR_CONSUMER_KEY
    };
	
var flickr = new Flickr(config);

module.exports = flickr;