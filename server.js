var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
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

// Searches MongoDB database for CIDs
app.post('/api/getcid', function(req, res) {
	
	MongoClient.connect(mongoURL, function(err, db) {
		assert.equal(null, err);
		console.log('Connected successfully to MongoDB server');
		
		//TODO implement this for candidates too
		//TODO C. A. DUTCH RUPPERSBERGER , ROBERT P. CASEY JR. , E. SCOTT RIGELL returns null
		db.collection('crpids_memb_114').createIndex({ CRPName: 'text' });
		db.collection('crpids_memb_114').find(
			{ $text: { $search: '\"' + req.body.first + '\" \"' + req.body.last + '\"' } },
			{ _id: false, CID: true, CRPName: true }
		).limit(1).next(function(err, doc) {
			var cid = doc.CID;
			res.send(cid);
			console.log(cid);
		});
		
		db.close();
	});
		
});

// HTTPS requests for Google Civics API
app.post('/api/googlecivics', function(req, res) {
	var options = {
		hostname: 'www.googleapis.com',
		path: '/civicinfo/v2/representatives?address=' + req.body.zipcode + '&levels=country&roles=legislatorLowerBody&roles=legislatorUpperBody&key=AIzaSyD6waCPOR2fc1XrFTj2iTws9VLIE9a74Fo',
		method: 'GET',
		key: fs.readFileSync('key.pem'),
		cert: fs.readFileSync('cert.pem')
	};
	var string = '';
	var output = {};
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

// HTTPS requests for OpenSecrets API
app.post('/api/opensecrets', function(req, res) {
	
	var output = JSON.parse('{}');
	var iterateArray = ['candContrib', 'candIndustry', 'candSector'];
	
	var check = 0;
	var processhttp = function(count) {
		
		return function(data) {
			var string = '';
			console.log('statusCode: ', data.statusCode);
			data.on('data', function(chunk) {
				string += chunk;
			});
			data.on('end', function() {
				output[iterateArray[count]] = JSON.parse(string).response;
				if (check == iterateArray.length - 1) {
					res.json(processFinances(output));
					//console.log(JSON.stringify(output));
				} else {
					check++;
				}
			});
		};
		
	};
	
	for (var i = 0; i < iterateArray.length; i++) {
		var method = iterateArray[i];
		var options = {
			hostname: 'www.opensecrets.org',
			path: '/api/?method=' + method + '&cid=' + req.body.cid + '&output=json&apikey=ed5ee740eb24aed077cb205d563be6bd'
		};
		http.get(options, processhttp(i));
	}
	
});

var processFinances = function(inputObject) {
	
	// strips unnecessary containers
	inputObject.candContrib = inputObject.candContrib.contributors.contributor;
	inputObject.candIndustry = inputObject.candIndustry.industries.industry;
	inputObject.candSector = inputObject.candSector.sectors.sector;

	var outputObj = JSON.parse('{}');
	
	// strips unnecessary '@attributes' containers
	outputObj.candContrib = [];
	for (var i = 0; i < inputObject.candContrib.length; i++) {
		outputObj.candContrib.push(inputObject.candContrib[i]['@attributes']);
	}
	outputObj.candIndustry = [];
	for (var j = 0; j < inputObject.candIndustry.length; j++) {
		outputObj.candIndustry.push(inputObject.candIndustry[j]['@attributes']);
	}
	outputObj.candSector = [];
	for (var k = 0; k < inputObject.candSector.length; k++) {
		outputObj.candSector.push(inputObject.candSector[k]['@attributes']);
	}
	
	return outputObj;
	
};

app.listen(port);
console.log('Server started: http://localhost:' + app.get('port') + '/');