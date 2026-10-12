# City Weather Application

## Project Description

City Weather Application is a responsive web application that allows users to search for cities and view current weather conditions and a three-day weather forecast.

The application uses the Open-Meteo API to retrieve matching locations and weather information dynamically.

This project is developed using HTML, CSS, and JavaScript as part of the Frontend Development course at Kristianstad University.

## Features

- Search for a city by entering its name.
- Display matching locations with city, country, and region information.
- Select a specific location from the search results.
- Display current temperature, apparent temperature, and wind speed.
- Display weather conditions in readable text.
- View a three-day weather forecast.
- Display validation messages for empty searches.
- Handle unsuccessful API requests and missing results.
- Responsive layout for mobile and desktop devices.

## Technologies Used

- **HTML5:** Semantic structure and accessible form controls.
- **CSS3:** Responsive design using Flexbox, CSS Grid, and media queries.
- **JavaScript:** Form validation, functions, objects, arrays, DOM manipulation, event handling, and asynchronous API requests.
- **Open-Meteo API:** Retrieves geographical locations and weather information.
- **Git and GitHub:** Version control and project management.

## Project Structure

```text
city-weather-app/
│
├── index.html
├── styles.css
├── script.js
└── README.md
```

### File Descriptions

- `index.html` – Contains the structure of the application.
- `styles.css` – Contains the styling and responsive layout.
- `script.js` – Handles application logic, API requests, validation, and dynamic content.
- `README.md` – Provides project documentation.

## How the Application Works

1. The user enters a city name in the search field.
2. JavaScript validates the input and sends a request to the Open-Meteo Geocoding API.
3. Matching locations are displayed dynamically.
4. The user selects a location from the results.
5. The application retrieves weather information using the selected location's latitude and longitude.
6. The current weather and three-day forecast are displayed on the page.

## API Integration

The application uses two Open-Meteo API endpoints.

### 1. Geocoding API

The Geocoding API retrieves matching locations based on the city entered by the user.

Endpoint:

```text
https://geocoding-api.open-meteo.com/v1/search
```

The returned data includes location names, countries, administrative regions, latitudes, and longitudes.

### 2. Weather Forecast API

The Weather Forecast API retrieves weather information using the coordinates of the selected location.

Endpoint:

```text
https://api.open-meteo.com/v1/forecast
```

The application displays:

- Current temperature
- Apparent temperature
- Wind speed
- Weather condition
- Three-day forecast with dates, minimum temperatures, maximum temperatures, and weather conditions

API documentation: https://open-meteo.com/

## JavaScript Functionality

The application demonstrates several important JavaScript concepts:

- Event listeners for user interactions.
- Form validation and input handling.
- Functions with parameters and return values.
- Objects and arrays for organising data.
- Array iteration for displaying repeated content.
- DOM manipulation for dynamically updating the webpage.
- `async` and `await` for asynchronous API requests.
- `fetch()` for retrieving external data.
- `try...catch` for error handling.

## Responsive Design

The application follows a mobile-first design approach.

CSS Grid and Flexbox are used to organise the layout, while media queries adapt the interface to different screen sizes, including screens below and above 1024px.

## Validation and Error Handling

The application is designed to handle the following situations:

- **Empty input:** Displays a validation message without making an API request.
- **No matching locations:** Displays a message informing the user that no results were found.
- **Failed API request:** Displays an understandable error message.
- **New search:** Clears or replaces outdated search results and weather information.

## Installation and Setup

To run the application locally:

1. Clone the GitHub repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   ```

2. Open the project folder in Visual Studio Code.

3. Open `index.html` in a web browser, preferably using a local development server such as VS Code Live Server.

4. Enter a city name and select a matching location to view the weather information.

An internet connection is required to retrieve data from the Open-Meteo API.

## Accessibility

The application uses semantic HTML elements, labelled form controls, descriptive buttons, logical headings, and feedback messages to improve usability and keyboard accessibility.

## Testing

The following scenarios are included in the assignment's acceptance checklist:

- [ ] Empty or whitespace-only input displays validation feedback.
- [ ] Valid city searches display selectable locations.
- [ ] Selecting a location retrieves current weather information.
- [ ] Three forecast days are displayed correctly.
- [ ] Unknown locations display a no-results message.
- [ ] New searches replace outdated information.
- [ ] Failed requests display understandable errors.
- [ ] The layout works on mobile and desktop screens.
- [ ] The application can be used with a keyboard.
- [ ] The browser console shows no uncaught errors.

## Author

**Chrispine Otiato**

Bachelor's Programme in Software Development  
Kristianstad University, Sweden

## Acknowledgements

Weather and location data are provided by [Open-Meteo](https://open-meteo.com/).