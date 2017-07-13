var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoURL = 'mongodb://user:pass@ds021326.mlab.com:21326/polysci-proj';

var app = express();

var port = process.env.PORT || 3000;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', express.static(path.join(__dirname, 'app')));

// Searches MongoDB database for CIDs
app.post('/api/getcid', function(req, res) {
	
	MongoClient.connect(mongoURL, function(err, db) {
		assert.equal(null, err);
		
		//TODO implement this for candidates too
		//TODO MICHAEL K. SIMPSON , C. A. DUTCH RUPPERSBERGER , ROBERT P. CASEY JR. , E. SCOTT RIGELL returns null
		db.collection('crpids_memb_114').createIndex({ CRPName: 'text' });
		db.collection('crpids_memb_114').find(
			{ $text: { $search: '\"' + req.body.first + '\" \"' + req.body.last + '\"' } },
			{ _id: false, CID: true, CRPName: true }
		).limit(1).next(function(err, doc) {
			var cid = doc.CID;
			res.send(cid);
			//console.log(cid);
		});
		
		db.close();
	});
		
});

app.post('/api/repbyzip', function(req, res) {
	
	var options = {
		hostname: 'whoismyrepresentative.com',
		path: '/getall_mems.php?zip=' + req.body.zipcode + '&output=json'
	};
	
	var string = '';
	var output = {};

	var request = http.request(options, function(data) {
		
		data.on('data', function(chunk) {
			string += chunk;
		});
		data.on('end', function() {
			if (data.statusCode == '200') {
				try {
					output = processRepresentatives(JSON.parse(string));
					res.json(output);
					//console.log(JSON.stringify(output));
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

app.post('/api/repbyname', function(req, res) {
	
	var options1 = {
		hostname: 'whoismyrepresentative.com',
		path: '/getall_reps_byname.php?name=' + req.body.name + '&output=json'
	};	
	var string1 = '';
	var output1 = JSON.parse('{"data": []}');

	var request = http.request(options1, function(data) {		
		data.on('data', function(chunk) {
			string1 += chunk;
		});
		data.on('end', function() {
			try {
				output1 = processRepresentatives(JSON.parse(string1));
			}
			catch (err) {	}
		});
	});
	request.end();
		
	var options2 = {
		hostname: 'whoismyrepresentative.com',
		path: '/getall_sens_byname.php?name=' + req.body.name + '&output=json'
	};
	var string2 = '';
	var output2 = JSON.parse('{"data": []}');

	request = http.request(options2, function(data) {
		data.on('data', function(chunk) {
			string2 += chunk;
		});
		data.on('end', function() {
			try {
				output2 = processRepresentatives(JSON.parse(string2));
			}
			catch (err) {	}
			
			var output = {};
			// TODO: MAKE SURE THIS TRIGGERS AFTER EVERYTHING ELSE
			output.data = output1.data.concat(output2.data);
			if (JSON.stringify(output).length < 15) {
				res.statusCode = 500;
				res.statusMessage = "Invalid name";
				res.send();
			} else {
				res.json(output);
				//console.log(JSON.stringify(output));
			}
		});
	});
	request.end();

});

var processRepresentatives = function(inputObject) {
	var outputObj = JSON.parse('{"data": []}');
	var outputArray = [];
	for (var i = 0; i < inputObject.results.length; i++) {
		
		var rep = inputObject.results[i];
		var state = rep.state;
		var district = rep.district;
		var office;
		if (parseInt(district)) {
			office = "United States House of Representatives " + state + "-" + district;
		} else {
			office = "United States Senate " + district;
		}
		
		outputArray.push({
			name: office,
			officials: [ rep ]
		});
				
	}
	outputObj.data = outputArray;
	return outputObj;
};

app.post('/api/opensecrets', function(req, res) {
	
	MongoClient.connect(mongoURL, function(err, db) {
		assert.equal(null, err);
		
		var time = Date.now() - 1209600000; // returns time two weeks ago
		var cursor = db.collection('finances').find(
			{cid: req.body.cid, timestamp: { $gt: time }}	
		);
		
		cursor.next(function(err, doc) {
			assert.equal(null, err);
			if (doc !== null) {
				//console.log('found existing entry');
				db.close();
				res.json(doc);
			} else {
				//console.log('launching new http request');
				newFinanceRequest(req.body.cid, function(newEntry) {
					newEntry.cid = req.body.cid;
					newEntry.timestamp = Date.now() / 1;
					try {
						db.collection('finances').update(
							{cid: req.body.cid},
							newEntry,
							{upsert: true}
						);
					} catch(err) {
						console.log(err);
					}
					db.close();
					res.json(newEntry);
				});
			}
		});
		
	});
			
});

// HTTPS requests for OpenSecrets API
var newFinanceRequest = function(cid, callback) {
	
	var output = JSON.parse('{}');
	var iterateArray = ['candContrib', 'candIndustry', 'candSector'];
	
	var check = 0;
	var processhttp = function(count) {
		
		return function(data) {
			var string = '';
			//console.log('statusCode: ', data.statusCode);
			data.on('data', function(chunk) {
				string += chunk;
			});
			data.on('end', function() {
				output[iterateArray[count]] = JSON.parse(string).response;
				if (check == iterateArray.length - 1) {
					callback( processFinances(output) );
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
			path: '/api/?method=' + method + '&cid=' + cid + '&output=json&apikey=ed5ee740eb24aed077cb205d563be6bd'
		};
		http.get(options, processhttp(i));
	}
	
};

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
