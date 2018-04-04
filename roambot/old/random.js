// fs.writeFile('./temp.jpg', new Buffer(res.body, 'base64'), function(err) {}); // saves image to file

//var cities = JSON.parse(fs.readFileSync( './roambot/worldcitiespop_streetview.txt', { encoding: 'utf8' }));
//var countries = JSON.parse(fs.readFileSync( './roambot/worldcitiespop_countrysort.txt', { encoding: 'utf8' }));
//var countriesKeys = Object.keys(countries);

function getRandomCity() {
	var country, cities, city;
	
	country = countriesKeys[getRandomInt(0, countriesKeys.length)];
	cities = countries[country];
	city = cities[getRandomInt(0, cities.length)];
	
	return city;	
}

// Returns a random integer between min (included) and max (excluded)
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}