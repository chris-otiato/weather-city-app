//The address of the geocoding API. It never changes, so it is a const.
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

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
    locationsList.append(listItem);
  });

  resultsCount.textContent =
    locations.length + (locations.length === 1 ? " result" : " results");
  locationsSection.hidden = false; //show the Step 1 card
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
