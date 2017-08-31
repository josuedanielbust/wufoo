'use strict';

console.time('Runtime');

let fs = require('fs');
let request = require('request');
let config = require('./config');

function needZero(number) {
	let theNumber = '';
	if (number.length == 1) { theNumber = '0' + number; }
	else { theNumber = number; }
	return theNumber;
}

function getReport(forms) {
	return Promise.all(forms.map(function (form) { return getEntries(form); })).then(
		values => { return values },
		error => { console.log('[ERROR]' + error); }
	);
}

function getEntries(form) {
	return new Promise(function(res, rej) {
		let dateCreated = config.year + '-' + needZero(config.month);
		let uri = 'https://' + config.subdomain + '.wufoo.com/api/v3/forms/' + form + '/entries.json?sort=EntryId&sortDirection=DESC&Filter1=DateCreated+Begins_with+' + dateCreated;
		let options = {
			uri: uri,
			method: 'GET',
			auth: config.auth
		};
		request(options, function(error, response, body) {
			if (error) {
				return rej({request: options, response: error});
			}
			let data = JSON.parse(body);
			let theData = data.Entries;
			let dataObject = { formName: form, theData };
			console.log({ options, statusCode: response.statusCode });
			return res(dataObject);
		});
	});
}

function cleanNewline(string) { return string.replace(/[\n\r]/g,' '); }

function parseJSONToCSV(data) {
	let keys = Object.keys(data[0]);
	let str = '';
	str = Object.keys(data[0]).join('|') + '\r\n';
	for (let i = 0; i < data.length; i++) {
		let line = '';
		for (let index in data[i]) {
			if (line !== '') { line += '|'; }
			let text = '';
			text += data[i][index];
			text = cleanNewline(text);
			line += text;
		}
		str += line + '\r\n';
	}
	return { str, length: data.length };
}

// Output to a CSV file
function exportSingleCSV(data) {
	return new Promise( function(resolve, reject) {
		if (data.theData[0] != null) {
			let filename = 'Report - ' + data.formName + '.csv';
			let info = parseJSONToCSV(data.theData);

			fs.writeFile(filename, info.str, function (error) {
				if (error) { return console.log(error);
				} else {
					console.log('=> Report Form was successfully created => "' + data.formName + '" with ' + info.length + " new entries");
					return resolve('');
				}
			});
		} else { return resolve(''); }
	})
}

function exportToCSV(fullData) {
	return Promise.all(fullData.map( function(data) {
		return exportSingleCSV(data);
	})).then(
		values => { return fullData},
		error => { console.log(error); }
	);
}

// Main execution
getReport(config.forms)
	.then(exportToCSV)
	.then(result => {
		console.log('=> Check your folder... \n');
		console.timeEnd('Runtime');
	}).catch(error => { throw error; });