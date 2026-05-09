const weatherContainer = document.querySelector(".weather-container");

const unitsToggle = document.querySelector(".units-toggle");
const unitsMenu = document.querySelector(".units-menu");
const daysToggle = document.querySelector(".days-toggle");
const daysMenu = document.querySelector(".days-menu");

const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-input");
const searchButton = document.querySelector(".search-button");

const loading = document.querySelector(".loading");
const error = document.querySelector(".error");
const errorMessage = document.querySelector(".error-message");
const initialState = document.querySelector(".initial-state");

unitsToggle.addEventListener("click", (e) => {
  const isHidden = unitsMenu.hasAttribute("hidden");
  unitsMenu.toggleAttribute("hidden");
  unitsToggle.setAttribute("aria-expanded", isHidden ? "true" : "false");
});

daysToggle.addEventListener("click", (e) => {
  const isHidden = daysMenu.hasAttribute("hidden");
  daysMenu.toggleAttribute("hidden");
  daysToggle.setAttribute("aria-expanded", isHidden ? "true" : "false");
});

document.addEventListener("click", (e) => {
  if (!unitsMenu.contains(e.target) && !unitsToggle.contains(e.target)) {
    unitsMenu.setAttribute("hidden", "");
    unitsToggle.setAttribute("aria-expanded", "false");
  }
  if (!daysMenu.contains(e.target) && !daysToggle.contains(e.target)) {
    daysMenu.setAttribute("hidden", "");
    daysToggle.setAttribute("aria-expanded", "false");
  }
});

window.addEventListener("load", () => {
  loading.setAttribute("hidden", "");
  weatherContainer.setAttribute("hidden", "");
  error.setAttribute("hidden", "");
});

const fetchWeatherData = async (location = "Cairo") => {
  try {
    loading.removeAttribute("hidden");
    weatherContainer.setAttribute("hidden", "");
    error.setAttribute("hidden", "");
    initialState.setAttribute("hidden", "");

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
    );
    if (response.ok) {
      const data = await response.json();
      console.log(data);

      if (!data.results || data.results.length === 0) {
        errorMessage.textContent = "No search result found!";
        throw new Error("No search result found");
      }
      const { latitude, longitude } = data.results[0];
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m&current=wind_speed_10m,precipitation,temperature_2m,apparent_temperature,relative_humidity_2m&timezone=auto`,
      );
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        console.log(weatherData);
        
      } else {
        errorMessage.textContent =
          "Failed to fetch weather data. Please try again.";
        throw new Error("Failed to fetch weather data");
      }
    } else {
      errorMessage.textContent =
        "Failed to fetch location data. Please try again.";
      throw new Error("Failed to fetch location data");
    }
  } catch (err) {
    console.error(err);
    loading.setAttribute("hidden", "");
    error.removeAttribute("hidden");
  }
};

fetchWeatherData();
