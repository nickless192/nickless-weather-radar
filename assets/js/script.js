var searchInputEl = document.getElementById("search-word");
var apiKey = "";
var currentStateContainerEl = document.getElementById("current-state");
var searchFormEl = document.getElementById("search-form");


// for testing
var cityTest = "Santo Domingo";
//
// icon url http://openweathermap.org/img/wn/10d@2x.png

var loadWeather = function (weatherInfo, cityName, country) {
    console.log(weatherInfo, cityName, country);
    currentStateContainerEl.textContent = "";
    var cityTitle = document.createElement("h2");
    cityTitle.classList = "subtitle is-3";
    cityTitle.textContent = `${cityName}, ${country}`;

    // var currTempEl = document.createElement("p");
    // currTempEl.textContent = `Temperature: ${weatherInfo.currTemp} deg C`;

    var currWeather = document.createElement("p");
    currWeather.innerHTML = `Temperature: ${weatherInfo.currTemp} \u00B0 C <br />
                                Pressure: ${weatherInfo.currPressure} Pa <br />
                                Humidity: ${weatherInfo.currHumidity} % <br />
                                UV Index: <span id="uv-index">${weatherInfo.currUVIndex}</span> <br />
                                Wind speed: ${weatherInfo.currWind} kph`



    currentStateContainerEl.append(cityTitle, currWeather);
    var forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = `<h2 class="subtitle">5-Day Forecast:</h2>`;
    
    var cardContainer = document.createElement("div");
    cardContainer.classList = "columns";

    for (var i = 0; i < weatherInfo.fiveDayForecast.length; i++) {
        var weatherCard = document.createElement("div");
        weatherCard.classList = "card column";

        var cardTitle = document.createElement("h3");
        cardTitle.classList = "title is-4";
        cardTitle.textContent = weatherInfo.fiveDayForecast[i].date;

        weatherCard.appendChild(cardTitle);

        var forecastWeather = document.createElement("p");
        forecastWeather.innerHTML = `Max Temp: ${weatherInfo.fiveDayForecast[i].maxTemp} \u00B0 C <br />
                                        Min Temp: ${weatherInfo.fiveDayForecast[i].minTemp} \u00B0 C <br />
                                        Pressure: ${weatherInfo.fiveDayForecast[i].pressure} Pa <br />
                                        Humidity: ${weatherInfo.fiveDayForecast[i].humidity} % <br />
                                        UV Index: <span id="uv-index-${i}">${weatherInfo.fiveDayForecast[i].UVindex}</span> <br />
                                        Wind speed: ${weatherInfo.fiveDayForecast[i].windSpeed} kph`

        weatherCard.appendChild(forecastWeather);
        cardContainer.appendChild(weatherCard);

        forecastContainer.appendChild(cardContainer);

        var uvIndexEl = document.getElementById("uv-index-"+i);
        uvIndexEl.classList = ""

        if (weatherInfo.fiveDayForecast[i].UVindex < 2) {
            uvIndexEl.classList = "has-background-success";
        } else if (weatherInfo.fiveDayForecast[i].UVindex >= 2 && weatherInfo.fiveDayForecast[i].UVindex < 5) {
            uvIndexEl.classList = "has-background-warning";
        } else if (weatherInfo.fiveDayForecast[i].UVindex >= 5 && weatherInfo.fiveDayForecast[i].UVindex < 7) {
            uvIndexEl.classList = "has-background-info";
        } else {
            uvIndexEl.classList = "has-background-danger";
        }
    }
}

var getWeather = function (lat, lon, cityName, country) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="+ lat +"&lon="+ lon +"&units=metric&appid=" + apiKey;
    // console.log(apiUrl);
    fetch(apiUrl).then( function (response) {
        response.json().then( function (data) {
            // console.log(data);

            var weatherInfo = {
                sunriseTime: data.current.sunrise,
                sunsetTime: data.current.sunset,
                currTemp: data.current.temp,
                currPressure: data.current.pressure,
                currHumidity: data.current.humidity,
                currUVIndex: data.current.uvi,
                currWind: data.current.wind_speed,
                currCondition: data.current.weather[0].description,
                currConditionIcon: data.current.weather[0].icon,
                fiveDayForecast: [
                ]
            }

            for (var i = 0; i < 5; i++) {
                var dailyForecast = {};

                dailyForecast.date = new Date (data.daily[i].dt * 1000).toLocaleDateString("en-CA");
                dailyForecast.minTemp = data.daily[i].temp.min;
                dailyForecast.maxTemp = data.daily[i].temp.max;
                dailyForecast.humidity = data.daily[i].humidity;
                dailyForecast.pressure = data.daily[i].pressure;
                dailyForecast.UVindex = data.daily[i].uvi;
                dailyForecast.windSpeed = data.daily[i].wind_speed; 
                dailyForecast.condition = data.daily[i].weather[0].description;
                dailyForecast.conditionIcon = data.daily[i].weather[0].icon;

                weatherInfo.fiveDayForecast.push(dailyForecast);
            }
            // console.log(weatherInfo);
            loadWeather(weatherInfo, cityName, country);
        })
    })
}

var getLatLon = function (searchWord) {
    var apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + searchWord.replace(" ", "+") + "&limit=5&appid=" + apiKey;
    
    // console.log(apiUrl);
    
    fetch(apiUrl).then(function(response) {
        response.json().then(function(data) {
            console.log(data);
            var lat = data[0].lat;
            var lon = data[0].lon;
            var cityName = data[0].name;
            var country = data[0].country;
            // lon = Math.round(lon*100)/100;
            getWeather(lat, lon, cityName, country);
        })
    })
}


// for getting coordinates from zip code
// http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}

// getLatLon(cityTest);

var retrieveCityName = function(event) {
    event.preventDefault();
    if (event.target.id === "search-btn") {
        var cityName = searchInputEl.value.trim();
        if (cityName) {
            getLatLon(cityName);
        } else {
            alert("Input cannot be empty");
        }
    }
}

searchFormEl.addEventListener("click", retrieveCityName);