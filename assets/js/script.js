var searchInputEl = document.getElementById("search-word");
var apiKey = "c9e07c1e829ea4092afdcc9b70a32569";
var currentStateContainerEl = document.getElementById("current-state");
var searchFormEl = document.getElementById("search-form");
var searchHistoryContainer = document.getElementById("search-history");
var searchHistory = [];
var loadingHistory = false;

var assignUVbg = function (uvIndexEl) {
    uvIndexEl.classList = ""

    // low UV index
    if (uvIndexEl.textContent < 2) {
        uvIndexEl.classList = "has-background-success has-text-white";
    // mid UV index
    } else if (uvIndexEl.textContent >= 2 && uvIndexEl.textContent < 5) {
        uvIndexEl.classList = "has-background-warning";
    // high UV index
    } else if (uvIndexEl.textContent >= 5 && uvIndexEl.textContent < 7) {
        uvIndexEl.classList = "has-background-orange has-text-white";
    // extreme UV index
    } else {
        uvIndexEl.classList = "has-background-danger has-text-white";
    }
}

var loadWeather = function (weatherInfo, cityName, state, country) {
    // console.log(weatherInfo, cityName, country);
    currentStateContainerEl.textContent = "";
    currentStateContainerEl.classList = "borders"
    var cityTitle = document.createElement("h2");
    cityTitle.classList = "subtitle is-3";
    // if state is not defined for the city, dont add it
    if (state === undefined) {
        cityTitle.innerHTML = `${cityName}, ${country} <img src="https://openweathermap.org/img/wn/${weatherInfo.currConditionIcon}.png">`;
    } else {
        cityTitle.innerHTML = `${cityName}, ${state}, ${country} <img src="https://openweathermap.org/img/wn/${weatherInfo.currConditionIcon}.png">`;
    }

    // create p element and add all current weather conditions
    var currWeather = document.createElement("p");
    currWeather.innerHTML = `Temperature: ${weatherInfo.currTemp} \u00B0 C <br />
                                Condition: ${weatherInfo.currCondition} <br />
                                Pressure: ${weatherInfo.currPressure} Pa <br />
                                Humidity: ${weatherInfo.currHumidity} % <br />
                                UV Index: <span id="uv-index" class="px-2">${weatherInfo.currUVIndex}</span> <br />
                                Wind speed: ${weatherInfo.currWind} kph`


    currentStateContainerEl.append(cityTitle, currWeather);
    var forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = `<h2 class="subtitle">5-Day Forecast:</h2>`;
    
    var cardContainer = document.createElement("div");
    cardContainer.classList = "columns";

    // assign background color to uv index
    assignUVbg(document.getElementById("uv-index"));

    // loop through 5 days of forecard and add to their invididual cards
    for (var i = 0; i < weatherInfo.fiveDayForecast.length; i++) {
        var weatherCard = document.createElement("div");
        weatherCard.classList = "card column";

        var cardTitle = document.createElement("h3");
        cardTitle.classList = "title is-4";
        cardTitle.innerHTML = `${weatherInfo.fiveDayForecast[i].date} <img src="https://openweathermap.org/img/wn/${weatherInfo.fiveDayForecast[i].conditionIcon}.png">`;

        weatherCard.appendChild(cardTitle);

        var forecastWeather = document.createElement("p");
        forecastWeather.innerHTML = `Max Temp: ${weatherInfo.fiveDayForecast[i].maxTemp}\u00B0 C <br />
                                        Min Temp: ${weatherInfo.fiveDayForecast[i].minTemp}\u00B0 C <br />
                                        Conditions: ${weatherInfo.fiveDayForecast[i].condition} <br />
                                        Pressure: ${weatherInfo.fiveDayForecast[i].pressure} Pa <br />
                                        Humidity: ${weatherInfo.fiveDayForecast[i].humidity} % <br />
                                        UV Index: <span id="uv-index-${i}" class="px-2">${weatherInfo.fiveDayForecast[i].UVindex}</span> <br />
                                        Wind speed: ${weatherInfo.fiveDayForecast[i].windSpeed} kph`

        weatherCard.appendChild(forecastWeather);
        cardContainer.appendChild(weatherCard);

        forecastContainer.appendChild(cardContainer);

        var uvIndexEl = document.getElementById("uv-index-"+i);

        // assign background color to uv index
        assignUVbg(uvIndexEl);

    }
}

var getWeather = function (lat, lon, cityName, state, country) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="+ lat +"&lon="+ lon +"&units=metric&appid=" + apiKey;
    // console.log(apiUrl);
    fetch(apiUrl).then( function (response) {
        response.json().then( function (data) {
            // console.log(data);

            // set up weatherInfo object with data from API for current forecast
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

            // set up weatherInfo object with data from API for 5-day forecast
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
            loadWeather(weatherInfo, cityName, state, country);
        })
    })
}
// save to local storage
var saveSearch = function() {
    localStorage.setItem("weather-search-history", JSON.stringify(searchHistory));
}

// load from local storage
var loadSearch = function() {
    searchHistory = JSON.parse(localStorage.getItem("weather-search-history"));

    if(!searchHistory) {
        // if searchHistory doesnt exist in localStorage, create it
        searchHistory = [];
    } else {
        for (var i = 0; i < searchHistory.length; i++) {
            setHistory(searchHistory[i]);
        }
    }

}

var getLatLon = function (searchWord) {
    // set apiURL for API call to get latitude and longitude from city name
    var apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + searchWord.replace(" ", "+") + "&limit=5&appid=" + apiKey;
    
    // console.log(apiUrl);
    
    fetch(apiUrl).then(function(response) {
        // console.log(response);
        if (response.ok) {
            response.json().then(function(data) {

                // console.log(data, data.length);
                if (data.length !== 0) {

                    var lat = data[0].lat;
                    var lon = data[0].lon;
                    var cityName = data[0].name;
                    var country = data[0].country;
                    var state = data[0].state;
                    // console(lat, lon);
                    getWeather(lat, lon, cityName, state, country);
                    
                    
                    // if we're not doing a load from history, update the search history
                    if (!loadingHistory) {
                        setHistory(cityName);
                        // push cityName to searchHistory array
                        searchHistory.push(cityName);
                        saveSearch();
                    } else {
                        loadingHistory = false;
                    }
                } else {
                    alert("Could not retrieve the city information. Please check for spelling and try again.");
                }
            })
        // error handling
        } else {
            alert("Error: please try again.");
        }
    })
}


var setHistory = function(cityName) {
    // using the cityname, create a button to load to search History container
    var historyBtn = document.createElement("button");
    historyBtn.textContent = cityName;
    historyBtn.classList = "button is-light is-fullwidth my-4"

    searchHistoryContainer.appendChild(historyBtn);    
}

var clearHistory = function() {
    // clears searchHistory array
    searchHistory = [];
    // removes all content from the page
    searchHistoryContainer.textContent = "";
    // clear the localStorage by saving the empty searchHistory array
    saveSearch();

}

var retrieveCityName = function(event) {
    event.preventDefault();
    if (event.target.id === "search-btn") {
        var cityName = searchInputEl.value.trim();
        if (cityName) {
            searchInputEl.value = "";
            getLatLon(cityName);
        } else {
            alert("Input cannot be empty");
        }
    } else if (event.target.id === "clear-btn") {
        clearHistory();
    }
}

var loadFromHistory = function(event) {
    // console.dir(event.target);
    if (event.target.localName === "button") {
        // console.log("button was pressed");
        loadingHistory = true;
        getLatLon(event.target.textContent);
    }
}

// event listener to capture the Search and Clear History buttons
searchFormEl.addEventListener("click", retrieveCityName);

// add event listener to searchHistory container and use the text of the button and call getLatLon function
searchHistoryContainer.addEventListener("click", loadFromHistory);

// load from localStorage on page load
loadSearch();
