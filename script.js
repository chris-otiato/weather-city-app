//The address of the geocoding API. It never changes, so it is a const.
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
//The address of the weather API
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

//Selecting the existing HTML elements needed
//The variables never get a new value so we use const
const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const statusMessage = document.querySelector("#status-message");
const locationsSection = document.querySelector("#locations-section");
const resultsCount = document.querySelector("#results-count");
const locationsList = document.querySelector("#locations-list");
const weatherSection = document.querySelector("#weather-section");
const selectedLocationText = document.querySelector("#selected-location");
const currentWeatherContent = document.querySelector(
  "#current-weather-content",
);
const forecastList = document.querySelector("#forecast-list");

//A function that prepares the search value
//Takes in rawValue as a parameter and returns a value the trimmed text(removes white spaces)
function prepareSearchValue(rawValue) {
  return rawValue.trim();
}

async function getLocations(cityName) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Location request failed");
  }
  const data = await response.json();
  return data.results || [];
}

async function getWeatherData(latitude, longitude) {
  const url =
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
    "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather request failed");
  }

  const data = await response.json();

  //A response can be "ok" and still missing the parts we need,
  //so we check before using it.
  if (!data.current || !data.daily) {
    throw new Error("Weather data is missing");
  }

  return data;
}

//Takes ONE result from the API and returns our own simple object.
function createLocationObject(apiResult) {
  return {
    name: apiResult.name,
    country: apiResult.country || "",
    region: apiResult.admin1 || "",
    latitude: apiResult.latitude,
    longitude: apiResult.longitude,
  };
}

//Builds the text shown under the city name
function formatLocationDetails(location) {
  return [location.region, location.country].filter(Boolean).join(", ");
}

//A function that shows a message to the user
//Takes 2 params: message(text to show) and type(error, loading, success)
//Type will be CSS selector that sets color.

//Provided by the assignment. Translates a weather code into readable text.
function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown conditions";
}

//Takes the raw API data and returns our own simple object:
//{ current: {...}, forecast: [ {...}, {...}, {...} ] }
function createWeatherObject(data) {
  //data.daily holds parallel arrays. The same position in each array
  //is the same day: index 0 is day 1, index 1 is day 2, and so on.
  //slice(0, 3) keeps only the first three dates, in the order the API gave them.
  //map() builds one object per day. "index" tells us which day we are on,
  //so we can read the matching value from the other arrays.
  const forecast = data.daily.time.slice(0, 3).map((date, index) => {
    return {
      date: date,
      description: getWeatherDescription(data.daily.weather_code[index]),
      min: data.daily.temperature_2m_min[index],
      max: data.daily.temperature_2m_max[index],
    };
  });

  return {
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      windSpeed: data.current.wind_speed_10m,
      description: getWeatherDescription(data.current.weather_code),
    },
    forecast: forecast,
  };
}

//Turns a number into text for the page: 17.6 becomes "18°C"
function formatTemperature(value) {
  return Math.round(value) + "°C";
}

//Turns "2026-10-16" into text like "Fri, Oct 16"
//Adding a time stops the browser treating the date as UTC,
//which could show the day before in some time zones.
function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

//Builds the text for the selected place, for example "Kristianstad, Skåne County, Sweden"
function formatLocationName(location) {
  return [location.name, location.region, location.country]
    .filter(Boolean)
    .join(", ");
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = "status status--" + type;
}

//Removes old results so every new search starts clean
function clearResults() {
  locationsList.replaceChildren(); //empties the list
  locationsSection.hidden = true; //hides the previous steps cards
  weatherSection.hidden = true;
}

//Creates one list item with a button for every location in the array
function displayLocations(locations) {
  //forEach runs the code inside once for each location
  locations.forEach((location) => {
    const listItem = document.createElement("li");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "location-button";

    const nameElement = document.createElement("span");
    nameElement.className = "location-name";
    nameElement.textContent = location.name;

    const detailsElement = document.createElement("span");
    detailsElement.className = "location-region";
    detailsElement.textContent = formatLocationDetails(location);

    //Build from the inside out: spans go in the button,
    //the button goes in the list item, the list item goes in the list.
    button.append(nameElement, detailsElement);
    listItem.append(button);
    button.addEventListener("click", () => handleLocationSelect(location));
    locationsList.append(listItem);
  });

  resultsCount.textContent =
    locations.length + (locations.length === 1 ? " result" : " results");
  locationsSection.hidden = false; //show the Step 1 card
}

//Creates one element with a class and some text, and returns it.
//We use this many times below, so writing it once avoids repeated code.
function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

//Creates one small box, for example "Feels like" and "15°C"
function createDetailItem(label, value) {
  const item = document.createElement("div");
  item.className = "detail-item";
  item.append(
    createTextElement("div", "detail-label", label),
    createTextElement("div", "detail-value", value),
  );
  return item;
}

//Shows the current weather: big temperature, condition, and two detail boxes
function displayCurrentWeather(current) {
  const details = document.createElement("div");
  details.className = "current-details";
  details.append(
    createDetailItem(
      "Feels like",
      formatTemperature(current.apparentTemperature),
    ),
    createDetailItem("Wind speed", Math.round(current.windSpeed) + " km/h"),
  );

  //replaceChildren removes the old content and puts the new content in
  currentWeatherContent.replaceChildren(
    createTextElement(
      "p",
      "current-temp",
      formatTemperature(current.temperature),
    ),
    createTextElement("p", "current-condition", current.description),
    details,
  );
}

//Shows one card for each forecast day
function displayForecast(forecast) {
  forecastList.replaceChildren(); //remove old forecast cards

  //forEach runs the code once for each of the three days
  forecast.forEach((day) => {
    const listItem = document.createElement("li");
    listItem.className = "forecast-day";
    listItem.append(
      createTextElement("p", "forecast-date", formatDate(day.date)),
      createTextElement("p", "forecast-condition", day.description),
      createTextElement(
        "p",
        "forecast-temps",
        "Low " +
          formatTemperature(day.min) +
          " · High " +
          formatTemperature(day.max),
      ),
    );
    forecastList.append(listItem);
  });
}

//Shows the whole weather card by calling the smaller functions
function displayWeather(location, weather) {
  selectedLocationText.textContent = formatLocationName(location);
  displayCurrentWeather(weather.current);
  displayForecast(weather.forecast);
  weatherSection.hidden = false; //show the Step 2 card
}

//Runs when the user clicks a location button.
//"location" is our own object, so it contains the latitude and longitude.
async function handleLocationSelect(location) {
  showStatus(`Loading weather for ${location.name}...`, "loading");

  weatherSection.hidden = true;

  try {
    const weatherData = await getWeatherData(
      location.latitude,
      location.longitude,
    );
    const weather = createWeatherObject(weatherData);

    displayWeather(location, weather);
    showStatus(`Weather loaded for ${location.name}.`, "success");
  } catch (error) {
    console.error(error); //temporary: remove later
    showStatus("Could not load the weather. Please try again.", "error");
  }
}

//The function that runs when the form is submitted
//The browser automatically passes it an "event" object
async function handleSearchSubmit(event) {
  event.preventDefault(); //Prevents the form from reloading
  const cityName = prepareSearchValue(cityInput.value);
  clearResults();

  if (cityName === "") {
    showStatus("Please enter a city.", "error");
    return;
  }
  showStatus("Searching for locations...", "loading");
  try {
    const apiResults = await getLocations(cityName);

    if (apiResults.length === 0) {
      showStatus(`No locations found for "${cityName}".`, "error");
      return;
    }

    //map() runs createLocationObject on every item and returns a NEW array
    const locations = apiResults.map(createLocationObject);

    displayLocations(locations);
    showStatus("Choose a location to see its weather.", "success");
  } catch (error) {
    console.error(error);
    showStatus("Could not load locations. Please try again.", "error");
  }
}
searchForm.addEventListener("submit", handleSearchSubmit);
