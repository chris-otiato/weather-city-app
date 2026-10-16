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

//Runs when the user clicks a location button.
//"location" is our own object, so it contains the latitude and longitude.
async function handleLocationSelect(location) {
  showStatus(`Loading weather for ${location.name}...`, "loading");

  try {
    const weatherData = await getWeatherData(
      location.latitude,
      location.longitude,
    );
    const weather = createWeatherObject(weatherData);

    //Temporary: look at our processed object in the Console
    console.log(weather);
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
