//The address of the geocoding API. It never changes, so it is a const.
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

//Selecting the existing HTML elements needed
//The variables never get a new value so we use const
const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const statusMessage = document.querySelector("#status-message");

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


//A function that shows a message to the user
//Takes 2 params: message(text to show) and type(error, loading, success)
//Type will be CSS selector that sets color.
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = "status status--" + type;
}

//The function that runs when the form is submitted
//The browser automatically passes it an "event" object
async function handleSearchSubmit(event) {

  event.preventDefault(); //Prevents teh form from reloading
  const cityName = prepareSearchValue(cityInput.value);

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

//Temporary: print the raw API data so we can look at it
    console.log(apiResults);
    showStatus("Found " + apiResults.length + " location(s).", "success");
  } catch (error) {
    showStatus("Could not load locations. Please try again.", "error");
  }
}
searchForm.addEventListener("submit", handleSearchSubmit);


