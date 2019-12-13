// PACKAGES NEEDED
request = require('request');
const fs = require('fs');
const path = require('path');
const csv2json = require('./csv2json.js');
let converter = require('json-2-csv');

// ACCOUNTS

const appID = [
    "id1012933748",
    "id1078289048",
    "id509469724",
    "id515257559",
    "id1468868278"
    ...
];


// CONFIGURATION

var date = new Date();
date.setDate(date.getDate() - 1)
var dd = String(date.getDate()).padStart(2, '0');
var mm = String(date.getMonth() + 1).padStart(2, '0');
var yyyy = date.getFullYear();
date = yyyy + '-' + mm + '-' + dd;


const reportType = 'partners_by_date_report';  // OR 'partners_report'
const apiToken = 'ENTER API KEY';
const from = '2019-12-19'; // YYYY-MM-DD (Change date range here if different from yesterday)
const to = date; // YYYY-MM-DD (Change date range here if different from yesterday)

// API CALL FUNCTION

async function init() {

    var arrayJSON = [];
    var promise = new Promise(function(resolve, reject) {
        var counter = 0;
        console.log("loop start");
        for (let i = 0; i < appID.length; i++) {
            const requestUrl = 'https://hq.appsflyer.com/export/' + appID[i] + '/' + reportType + '/v5?api_token=' + apiToken + '&from=' + from + '&to=' + to;
            request(requestUrl, (error, response, body) => {
                if (error) {
                    console.log('There was a problem retrieving data:', error);
                } else if (response.statusCode != 200) {
                    if (response.statusCode === 404) {
                        console.log('Problem with the request URL. Make sure that it is correct' + '-->' + appID[i]);
                    } else {
                        console.log('There was a problem retrieving data:', response.body);
                    }
                } else {
                    var responseCSV = response.body;
                    var responseJson = csv2json(responseCSV, {parseNumbers: true});
                    arrayJSON.push(responseJson);
                    counter++;
                    if (counter < appID.length) {    
                    } else {
                        resolve("BOOM");
                    };
                };
            });
        };

    });
    promise.then(function(result) {
        var JSONmerged = [].concat.apply([], arrayJSON);
        converter.json2csv(JSONmerged, json2csvCallback);
    }, function(err) {
        console.log(err);
    });

};

let json2csvCallback = function(err, csv) {
    if (err) throw err;
    fs.writeFile('fullDailyReport.csv', csv, 'utf8', function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('SUCCESS');
        }
    });
};



// START

init();
