console.log("script.js is running");


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

//A function that shows a message to the user
//Takes 2 params: message(text to show) and type(error, loading, success)
//Type will be CSS selector that sets color.
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = "status status--" + type;
}

//The function that runs when the form is submitted
//The browser automatically passes it an "event" object
function handleSearchSubmit(event) {

  event.preventDefault(); //Prevents teh form from reloading
  const cityName = prepareSearchValue(cityInput.value);

  if (cityName === "") {
    showStatus("Please enter a city.", "error");
    return;
  }

// Temporary line to prove it works. We replace it in the next step.
  showStatus("You searched for: " + cityName, "success");
}
searchForm.addEventListener("submit", handleSearchSubmit);

