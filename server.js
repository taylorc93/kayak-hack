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

// Takes a location in a query string and returns all the results sorted
// by time first and then by location in JSON format. 
app.get('/requests', function(req, res){
	var location = req.query.location;

	pg.connect(connString, function(err, client, done){
		if (!err){
			client.query('SELECT * from requests', function(err, result){
				if (!err){
					res.send(JSON.stringify(result.rows));
				} else {
					console.log("Couldn't select");
					res.send(500);
				}
				done();
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

app.get('/location/:id', function(req, res){

});

app.post('/location/:id', function(req, res){

});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
