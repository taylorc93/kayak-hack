var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var connString = process.env.DATABASE_URL || "postgres://localhost:5432/lunchly"

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, res) {
  res.send('Hello World!');
});

function toRad(x) {
   return x * Math.PI / 180;
}

function parseCoords(coordPair){
	var coords = {
		lat: 0,
		lng: 0
	};

	var tokens = coordPair.split(",");
	console.log(tokens);

	coords.lat = parseFloat(tokens[0]);
	coords.lng = parseFloat(tokens[1]);

	return coords
}

function getValidRequests(results, location, distance){
	var coords1 = parseCoords(location);
	var radius = parseFloat(distance);
	var R = 6371; // km 

	var valid = []

	for (var i = 0; i < results.length; i++){
		coords2 = parseCoords(results[i].pickup_location);
		var x1 = coords2.lat - coords1.lat;
		var dLat = toRad(x1);  
		var x2 = coords2.lng - coords1.lng;
		var dLon = toRad(x2);  
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
		                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
		                Math.sin(dLon / 2) * Math.sin(dLon / 2);  
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
		var d = R * c;

		console.log(d);

		if (d <= radius){
			valid.push(results[i]);
		}
	}
	return valid;
}

// Takes a location in a query string and returns all the results sorted
// by time first and then by location in JSON format. 
app.get('/requests', function(req, res){
	var location = req.query.location;
	var distance = req.query.distance;
	var valid_requests = []

	pg.connect(connString, function(err, client, done){
		if (!err){
			client.query('SELECT * from requests', function(err, result){
				done();

				if (location && distance) {
					valid_requests = getValidRequests(result.rows, location, distance);
				} else {
					valid_requests = result.rows;
				}

				if (!err){
					res.send(JSON.stringify(valid_requests));
				} else {
					console.log("Couldn't select");
					res.send(500);
				}
			});
		} else {
			console.log("Error!");
			res.send(500);
			done();
		}
	});
});

// Takes in an info string, a location string, and a time string and inserts them
// into the database. 
app.post('/request', function(req, res){
	pg.connect(connString, function(err, client, done){
		if (!err){
			client.query("INSERT INTO requests (info, description, pickup_location, dropoff_location, time, taken, requester_id, driver_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [req.body.info, req.body.description, req.body.pickup_location, req.body.dropoff_location, req.body.time, false, 0, null], function(err, result) {

				if (!err){
					res.send("OK");
				} else {
					console.log("Couldn't insert");
					res.send(500);
				}
				done();
			});

		} else {
			console.log("Error!");
			request.send(500);
			done();
		}
	});
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
