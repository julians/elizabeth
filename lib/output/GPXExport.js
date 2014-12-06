var moment = require('moment');
var _ = require('underscore');
var fs = require('fs');
var request = require('request');
var libxmljs = require('libxmljs');

var DefaultPlugin = require(__dirname + '/../DefaultPlugin').Plugin;

function GPXExport(options) {
	this.help = {
		name: 'GPXExport',
		description: 'Exports as a GPX track',
		options: {
			outputFile: 'File name format for output files, placeholders: %date%',
			dateFormat: 'Date format to use',
		}
	}

	this.options = _.extend({
		outputFile: '%date%.gpx',
		dateFormat: 'YYYYMMDD',
	}, options);
}

GPXExport.prototype = Object.create(DefaultPlugin.prototype);

GPXExport.prototype.exportDay = function exportDay(day, cb) {

	var doc = new libxmljs.Document();
	var gpxNode = doc.node("gpx")
		.attr({
			version: "1.0",
			creator: "elizabeth.js GPXExportPlugin",
		    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
		    xmlns: "http://www.topografix.com/GPX/1/0",
		    "xsi:schemaLocation": "http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd"
		})
		
	if(!day.segments) {
		console.log(day);
 		cb('This day does not seem to have any segments');
 		return;
 	}
	
	coords = [];
 
 	day.segments.forEach(function(segment) {
 		var start = moment(segment.startTime, 'YYYYMMDDTHHmmssZ');
 		var end = moment(segment.endTime, 'YYYYMMDDTHHmmssZ');
 
 		if(segment.type == 'place') {
 			coords.push({
 				time: start,
 				lat: segment.place.location.lat,
 				lon: segment.place.location.lon,
 			});
 			coords.push({
 				time: end,
 				lat: segment.place.location.lat,
 				lon: segment.place.location.lon,
 			});
 			return;
 		}
 
 		// Add movements if we got an activities segment
 		if(segment.type == 'move' && Array.isArray(segment.activities)) {
 			segment.activities.forEach(function(activity) {
 				activity.trackPoints.forEach(function(point) {
 					coords.push({
						time: moment(point.time, 'YYYYMMDDTHHmmssZ'),
 						lat: point.lat,
 						lon: point.lon
 					});
 				})
 			});
 		}
 	});
	
	if (coords.length < 1) return;
	
	gpxNode.node("time", coords[0].time.format())
	var trkNode = gpxNode.node("trk")
	trkNode.node("name", "Moves.app Track - " + moment(day.date, "YYYYMMDD").format('dddd, D.M.YYYY'))
	trkNode = trkNode.node("trkseg")
	
	coords.forEach(function (coord) {
		trkNode.node("trkpt").attr({
			lat: ""+coord.lat,
			lon: ""+coord.lon
		}).node("time", coord.time.format())
	});

	fs.writeFile(this.getFilename(day.date), doc.toString(true), function(err) {
		if(err) {
			cb(err);
			return;
		}

		cb(null, day.date);
	});
	
	// 	request(url).pipe(writeStream);
}


exports.Plugin = GPXExport;
