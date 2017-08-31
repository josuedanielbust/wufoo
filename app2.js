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

function cleanNewline(string) { return string.replace(/[\n\r]/g,' '); }

function extractKeys(data) {
  let keys = {};
  for (let key in data) {
    keys[data[key].ID] = data[key].Title;
    if (data[key].SubFields != null) {
      for (let keyLabel in data[key].SubFields) {
        keys[data[key].SubFields[keyLabel].ID] = data[key].SubFields[keyLabel].Label;
      }
    }
  }
  return keys;
}

function generateUriEntries(form) {
  let uri = 'https://' + config.subdomain + '.wufoo.com/api/v3/forms/' + form + '/entries.json?sort=EntryId&sortDirection=DESC';
  if (config.montly) {
    uri += '&Filter1=DateCreated+Begins_with+' + config.year + '-' + needZero(config.month);
  }
  return uri;
}


function getAllEntries(forms) {
  return Promise.all(forms.map(function (form) { return getFormEntries(form); })).then(
		values => { return values },
		error => { console.log('[ERROR]' + error); }
	);
}

function getFormEntries(form) {
	return new Promise(function(res, rej) {
		let uri = generateUriEntries(form);
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
			let dataObject = { form: form, theData };
			//console.log({ options, statusCode: response.statusCode });
			return res(dataObject);
		});
	});
}

function getAllNames(forms) {
  return Promise.all(forms.map(function (form) { return getFormName(form); })).then(
		values => { return values },
		error => { console.log('[ERROR]' + error); }
	);
}

function getFormName(form) {
	return new Promise(function(res, rej) {
    let uri = 'https://' + config.subdomain + '.wufoo.com/api/v3/forms/' + form.form + '.json';
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
      let theName = data.Forms[0].Name;
      form["name"] = theName;
			return res(form);
		});
	});
}

function getAllKeys(forms) {
  return Promise.all(forms.map(function (form) { return getFormKeys(form); })).then(
    values => {return values },
    error => { console.log('[ERROR]' + error); }
  )
}

function getFormKeys(form) {
  return new Promise(function(res, rej) {
    let uri = 'https://' + config.subdomain + '.wufoo.com/api/v3/forms/' + form.form + '/fields.json';
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
      data = data.Fields;
      let theKeys = extractKeys(data);
      form["keys"] = theKeys;
			return res(form);
		});
	});
}

function parseJSONToCSV(data, mainKeys) {
	let keys = Object.keys(data[0]);
  let str = '';
  //str = Object.keys(mainKeys).join('|') + '\r\n';
  str = Object.keys(mainKeys).map(function(key){return mainKeys[key]}).join('|') + '\r\n';
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
			let filename = 'Report - ' + data.form + '.csv';
			let info = parseJSONToCSV(data.theData, data.keys);

			fs.writeFile(filename, info.str, function (error) {
				if (error) { return console.log(error);
				} else {
					console.log('=> Report Form was successfully created => "' + data.name + '" with ' + info.length + " new entries");
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
getAllEntries(config.forms)
  .then(getAllNames)
  .then(getAllKeys)
	.then(exportToCSV)
	.then(result => {
		console.log('=> Check your folder... \n');
		console.timeEnd('Runtime');
	}).catch(error => { throw error; });