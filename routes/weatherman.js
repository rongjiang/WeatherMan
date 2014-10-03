var https = require('http');

// retrieve weather info from Weather Underground API
// for a given city entered from UI
exports.getWeathers = function(request, response) {
  var city;
  var state;
  if (request.method == "POST") {
    console.log("POST body: " + JSON.stringify(request.body));
    city = request.body.city;
    state = request.body.state;
  } else {
    console.log("GET queryString: " + JSON.stringify(request.query));
    city = request.query.city;
    state = request.query.state;
  }
  // URI Encoding all city/state/country provided as request params 
  var uriEncodedCity = encodeURIComponent(city);
  var uriEncodedState = encodeURIComponent(state);
  var uriEncodedCountry = encodeURIComponent("US");

  //formatted url for Wunderground API 
  var url = '/api/ee62a0ac3c9b57ba/conditions/q/' + uriEncodedCountry + 
            '/' + uriEncodedState + '/' + uriEncodedCity + '.json';

  //option object to be passed as http request
  var options = {
    hostname: 'api.wunderground.com',
    path: url,
    method: 'GET'
  };

  console.log("getWeathers() " + url);

  //API call to Weather Underground Service
  var req = https.request(options, function(res) {
    console.log("city: %s,%s status: %d", city, state, res.statusCode);

    // make sure the response data is complete
    // some API call (account) has more data than other type of accounts
    var responseData = ""
    res.on('data', function(data) { responseData += data; });
    res.on('end', function() {
      // console.log("Response from Wunderground API: " + responseData); 
      // JSON object that holds the response data from the API call
      var result; 
        try {
          result = JSON.parse(responseData);
        } catch (err) {
          console.log("getWeathers(): Failed to parse result! " + err);
          result = {'status_code': 500, 'status_text': 'JSON Parse Failed'};
          response.statusCode = 500;
          response.end(JSON.stringify(result));
        }
        if (result) {
          if (result.current_observation != null) {
            // JSON response has current_observation attribute, 
            // weather data was successfully received.
            response.statusCode = 200;
            response.end(JSON.stringify(result.current_observation));
          } else {
            // Invalid city and state, return the suggestion
            // to client with 404 status code.
            response.statusCode = 404;
            response.end(JSON.stringify(result));
          }
        }
    });
  });
  req.end();

  req.on('error', function(e) {
    console.error(e);
    response.statusCode = 500;
    var result = {'status_code': 500, 'status_text': 'Internal error!'};
    response.end(JSON.stringify(result));
  });
};
