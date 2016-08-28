var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var fs = require('fs');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoURL = 'mongodb://127.0.0.1:27017/polysci-proj';

var app = express();

var port = 3000;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', express.static(path.join(__dirname, 'app')));

// middleware that (hopefully) ensures zip code is always received
app.use(function(req, res, next) {
	console.log(req.body.zipcode);
	next();
});

// HTTPS requests for Google Civics API
app.post('/api/representatives', function(req, res) {
	var options = {
		hostname: 'www.googleapis.com',
		path: '/civicinfo/v2/representatives?address=' + req.body.zipcode + '&levels=country&roles=legislatorLowerBody&roles=legislatorUpperBody&key=AIzaSyD6waCPOR2fc1XrFTj2iTws9VLIE9a74Fo',
		method: 'GET',
		key: fs.readFileSync('key.pem'),
		cert: fs.readFileSync('cert.pem')
	};
	var string = '';
	var request = https.request(options, function(data) {
		console.log('statusCode: ', data.statusCode);
		data.on('data', function(chunk) {
			string += chunk;
		});
		data.on('end', function() {
			if (data.statusCode == '200') {
				try {
					output = processRepresentatives(JSON.parse(string));
					res.json(output);
					console.log(JSON.stringify(output));
				}
				catch (err) {
					res.statusCode = 500;
					res.statusMessage = "Invalid zip code";
					res.send();
				}
			}
			else {
				res.statusCode = data.statusCode;
				res.statusMessage = "Invalid zip code"; // send something else?
				res.send();
			}
		});
	});
	request.end();
});

// TODO: continue formatting this
var processRepresentatives = function(inputObject) {
	var outputObj = JSON.parse('{"data": []}');
	var outputArray = [];
	for (var i=0; i<inputObject.offices.length; i++) {
		var office = inputObject.offices[i];
		var tempArray = [];
		for (var j=0; j<office.officialIndices.length; j++) {
			tempArray.push(inputObject.officials[office.officialIndices[j]]);
		}
		var tempJSON = {
			name: office.name,
			officials: tempArray
		};
		outputArray.push(tempJSON);
	}
	outputObj.data = outputArray;
	return outputObj;
};

MongoClient.connect(mongoURL, function(err, db) {
	assert.equal(null, err);
	console.log('Connected successfully to MongoDB server');
	db.close();
});

app.listen(port);
console.log('Server started: http://localhost:' + app.get('port') + '/');