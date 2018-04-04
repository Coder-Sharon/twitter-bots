/**
 * bot.js
 */

'use strict';

var express = require('express');
require('dotenv').config()

var roambot = require('./roambot');
var painterbot = require('./painterbot');

// Setup server
var app = express();

/* 
* TO-DO:
* host server
* package.json
*/

// Launch bots
//roambot.launch();
painterbot.launch();

app.listen(3000);
console.log('Listening on port 3000!');

module.exports = app;