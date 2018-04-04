/**
 * clarifai.js
 */

 'use strict';

var Clarifai = require("clarifai"),
    clarifai = new Clarifai.App(
		process.env.CLARIFAI_CLIENT_ID,
		process.env.CLARIFAI_CLIENT_SECRET
	);

module.exports = clarifai;