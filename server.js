require('console-stamp')(console, "[yyyy/dd/mm HH:mm:ss.l]");

var express = require('express');
var URL = require('url');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// route for getting weather info for cities
var weatherman = require('./routes/weatherman');

// title for the app
app.set('title', 'Weather Man');

// logging using middleware
app.use(function(request, response, next) {
  if (request.method == "POST") {
    console.log("%s POST %s %s", request.ip, request.path, JSON.stringify(request.body));
  } else {
    console.log("%s GET %s %s", request.ip, request.path, JSON.stringify(request.query));
  }
  next();
});

// call middleware to get weather info for cities
app.get('/getWeathers', weatherman.getWeathers);
// support post request also
app.post('/queryWeathers', weatherman.getWeathers);

app.use(express.static(__dirname, "/client"));

var server = app.listen(4000, function() {
  console.log('Listening on port %d', server.address().port);
});
