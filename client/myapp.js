var cities = [];

function startApp() {
  addNewCity("timonium", "md");
  addNewCity("austin", "tx");
  addNewCity("omaha", "ne");
  addNewCity("campbell", "ca");
}

function addCity() {
  var addCityForm = document.getElementById("addCityForm");
  var resultTable = document.getElementById("resultTable");
  city = addCityForm.elements["city"].value;
  state = addCityForm.elements["state"].value;
  if (isValid(city, state)) {
    var existingCity = findCity(city, state);
    if (existingCity) {
      // We already have an existing city, show the row
      existingCity.row.style.display = "";
      getWeather(existingCity);
    } else {
      addNewCity(city, state);
    }
  }
}

function findCity(city, state) {
  for (var i in cities) {
    if (city.toLowerCase() == cities[i].city &&
        state.toLowerCase() == cities[i].state) {
      showFormMessage("Found the city: " + city);
      return cities[i];
    }
  }
  return null;
}

function newTextNode(str) {
  return document.createTextNode(str);
}

function addNewCity(city, state) {  
  var newCity = new Object();
  newCity.city = city.toLowerCase();
  newCity.state = state.toLowerCase();
  var row = resultTable.insertRow(1);
  newCity.row = row;
  row.insertCell(0).appendChild(newTextNode(capitalize(city)));
  row.insertCell(1).appendChild(newTextNode(state.toUpperCase()));
  row.insertCell(2).appendChild(newTextNode("Loading..."));
  cities[cities.length] = newCity;
  getWeather(newCity);
}

function getWeather(cityObject) {
  var request = new XMLHttpRequest();
  var queryString = "city=" + escape(cityObject.city) + "&state=" + escape(cityObject.state);
  request.open("get", "/getWeathers?" + queryString, true);
  // Also we could use POST, but it's better to use GET here.
  // request.open("post", "/queryWeathers", true);
  // request.setRequestHeader("Content-type","application/x-www-form-urlencoded");

  request.responseType = "json";
  request.onreadystatechange = function () { checkResult(request, cityObject); }
  request.send();
  // request.send(queryString);
}

function checkResult(request, cityObject) {
  if (request.readyState == 4) {
    if (request.status == 200) {
      var cell = cityObject.row.cells[2];
      cell.innerHTML = "";
      cell.appendChild(newTextNode(request.response.weather));
      var iconImg = document.createElement("img");
      iconImg.src = request.response.icon_url;
      iconImg.align = "middle";
      cell.appendChild(iconImg);
      cell.appendChild(newTextNode(request.response.temperature_string));
    } else if (request.status == 404) {
      // alert("Invalid city: " + cityObject.city + ", " + cityObject.state);
      alert(JSON.stringify(request.response));
      hideRow(cityObject.row);
    } else if (request.status == 500) {
      alert("Internal error");
      hideRow(cityObject.row);
    }
  }
}

function hideRow(row) {
  row.style.display = "none";
}

function isBlank(str) {
  return (!str || /^\s*$/.test(str));
}

function showFormMessage(msg) {
  var element = document.getElementById("formMessage");
  element.innerHTML = "";
  if (isBlank(msg)) {
    element.style.display = "none";
  } else {
    element.style.display = "";
    element.appendChild(newTextNode(msg));
  }
}

function isValid(city, state) {
  showFormMessage("");
  if (isBlank(city)) {
    showFormMessage("Missing city");
    return false;
  }
  if (isBlank(state)) {
    showFormMessage("Missing state");
    return false;
  }
  if (state.length != 2) {
    showFormMessage("Invalid state: " + state);
    return false;
  }
  return true;
}

function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}
