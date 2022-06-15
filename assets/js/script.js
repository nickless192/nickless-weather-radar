var searchInputEl = document.getElementById("search-word");
var apiKey = "c9e07c1e829ea4092afdcc9b70a32569";
// for testing
var cityTest = "Santo Domingo";
//

var getWeather = function (lat, lon) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="+ lat +"&lon="+ lon +"&units=metric&appid=" + apiKey;
    console.log(apiUrl);
    fetch(apiUrl).then( function (response) {
        response.json().then( function (data) {
            console.log(data);
        })
    })
}

var getLatLon = function (searchWord) {
    var apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + searchWord.replace(" ", "+") + "&limit=5&appid=" + apiKey;
    
    console.log(apiUrl);
    
    fetch(apiUrl).then(function(response) {
        response.json().then(function(data) {
            console.log(data);
            var lat = data[0].lat;
            var lon = data[0].lon;
            // lon = Math.round(lon*100)/100;
            getWeather(lat, lon);
        })
    })
}


// for getting coordinates from zip code
// http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}

getLatLon(cityTest);