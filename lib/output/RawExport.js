var moment = require('moment');
var _ = require('underscore');

var fs = require('fs');
var request = require('request');

var DefaultPlugin = require(__dirname + '/../DefaultPlugin').Plugin;

function RawExport(options) {
	this.help = {
		name: 'RawExport',
		description: 'Exports as a json file',
		options: {
			outputFile: 'File name format for output files, placeholders: %date%',
			dateFormat: 'Date format to use',
		}
	}

	this.options = _.extend({
		outputFile: '%date%.json',
		dateFormat: 'YYYYMMDD',
	}, options);
}

RawExport.prototype = Object.create(DefaultPlugin.prototype);

RawExport.prototype.exportDay = function exportDay(day, cb) {

    fs.writeFile(this.getFilename(day.date), JSON.stringify(day), function(err) {
    	if(err) {
    		cb(err);
    		return;
    	}

    	cb(null, day.date);
    });
	
}

function round_coord(x) {
	return Math.round(parseFloat(x) * 10000, 4) / 10000;
}

function coordinates_to_string(coords) {
    var locationString = '';

    coords.forEach(function(point) {
        locationString += '%7C' + point.lat + ',' + point.lon;
    });

    return locationString;
}

function reduceLocations(locations, number) {
    if (locations.length <= number) {
        return locations;
    };

    var distance = locations.length / number;
    var currentObject = 0;
    var newLocations = new Array();

    for (var i = 0; i < number; i++) {
        newLocations.push(locations[Math.round(currentObject)]);
        currentObject += distance;
    }

    newLocations.push(locations[locations.length - 1]);

    return newLocations;
}


exports.Plugin = RawExport;
