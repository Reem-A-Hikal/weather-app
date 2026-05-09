const weatherContainer = document.querySelector(".weather-container");

const unitsToggle = document.querySelector(".units-toggle");
const unitsMenu = document.querySelector(".units-menu");
const changeUnitsButton = unitsMenu.querySelector(".changeUnits");
const daysToggle = document.querySelector(".days-toggle");
const daysMenu = document.querySelector(".days-menu");

const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-input");
const defaultLocation = "Cairo";
let currentLocation = "Cairo";
let temperatureUnit = "celsius";
let windSpeedUnit = "kmh";
let precipitationUnit = "mm";

const searchButton = document.querySelector(".search-button");

const loading = document.querySelector(".loading");
const error = document.querySelector(".error");
const errorMessage = document.querySelector(".error-message");

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
  const isCelsius = temperatureUnit === "celsius";
  changeUnitsButton.textContent = isCelsius
    ? "Switch to Imperial"
    : "Switch to Metric";

  const userInputLocation = localStorage.getItem("location") || defaultLocation;

  currentLocation = userInputLocation;
  fetchWeatherData(currentLocation);
  loading.setAttribute("hidden", "");
  weatherContainer.setAttribute("hidden", "");
  error.setAttribute("hidden", "");
});

unitsMenu.addEventListener("change", async (e) => {
  temperatureUnit = unitsMenu.querySelector(
    'input[name="temperature"]:checked',
  ).value;
  precipitationUnit = unitsMenu.querySelector(
    'input[name="precipitation"]:checked',
  ).value;
  windSpeedUnit = unitsMenu.querySelector(
    'input[name="wind-speed"]:checked',
  ).value;

  changeUnitsButton.textContent =
    "Switch to " + (temperatureUnit === "celsius" ? "Imperial" : "Metric");
  loading.removeAttribute("hidden");
  weatherContainer.setAttribute("hidden", "");
  error.setAttribute("hidden", "");
  await fetchWeatherData(
    currentLocation,
    temperatureUnit,
    windSpeedUnit,
    precipitationUnit,
  );
});

changeUnitsButton.addEventListener("click", async (e) => {
  let isCelsius = temperatureUnit === "celsius";
  let newTemperatureUnit = isCelsius ? "fahrenheit" : "celsius";
  let newWindSpeedUnit = windSpeedUnit === "kmh" ? "mph" : "kmh";
  let newPrecipitationUnit = precipitationUnit === "mm" ? "inch" : "mm";

  unitsMenu.querySelector(
    `input[name="temperature"][value="${newTemperatureUnit}"]`,
  ).checked = true;
  unitsMenu.querySelector(
    `input[name="wind-speed"][value="${newWindSpeedUnit}"]`,
  ).checked = true;
  unitsMenu.querySelector(
    `input[name="precipitation"][value="${newPrecipitationUnit}"]`,
  ).checked = true;

  temperatureUnit = newTemperatureUnit;
  windSpeedUnit = newWindSpeedUnit;
  precipitationUnit = newPrecipitationUnit;

  changeUnitsButton.textContent =
    "Switch to " + (isCelsius ? "Metric" : "Imperial");

  fetchWeatherData(
    currentLocation,
    newTemperatureUnit,
    newWindSpeedUnit,
    newPrecipitationUnit,
  );
});

const fetchWeatherData = async (
  location = currentLocation,
  unit = "celsius",
  windSpeedUnit = "km/h",
  precipitationUnit = "mm",
) => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
    );
    if (response.ok) {
      const Locdata = await response.json();
      console.log(Locdata);

      if (!Locdata.results || Locdata.results.length === 0) {
        errorMessage.textContent = "No search result found!";
        throw new Error("No search result found");
      }
      const { latitude, longitude } = Locdata.results[0];
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weathercode&current=wind_speed_10m,precipitation,temperature_2m,apparent_temperature,relative_humidity_2m,weathercode${windSpeedUnit === "mph" ? "&wind_speed_unit=mph" : ""}${unit === "fahrenheit" ? "&temperature_unit=fahrenheit" : ""}${precipitationUnit === "inch" ? "&precipitation_unit=inch" : ""}&timezone=auto`,
      );
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        console.log(weatherData);
        displayWeatherData(weatherData, Locdata.results[0]);
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

const weatherCodeMap = {
  1: "sunny",
  0: "sunny",
  2: "partly-cloudy",
  3: "overcast",
  45: "fog",
  48: "fog",
  51: "drizzle",
  53: "drizzle",
  55: "drizzle",
  56: "drizzle",
  57: "drizzle",
  61: "rain",
  63: "rain",
  65: "rain",
  66: "snow",
  67: "snow",
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snow",
  80: "rain",
  81: "rain",
  82: "rain",
  85: "snow",
  86: "snow",
  95: "storm",
  96: "storm",
  99: "storm",
};

function getWeatherIcon(code) {
  const iconName = weatherCodeMap[code] || "unknown";
  return `./assets/images/icon-${iconName}.webp`;
}

function displayWeatherData(data, locationData) {
  loading.setAttribute("hidden", "");
  const currentWeather = document.querySelector(".current-weather");

  currentWeather.classList.add("largebg");
  weatherContainer.removeAttribute("hidden");

  const displayCountry = document.querySelector(".country");

  displayCountry.textContent = `${locationData.name}, ${locationData.country}`;
  displayDatefn(data);
  displayCurrentWeather(data);
  displaymetric(data);
  displayForecastData(data);
}

function displayDatefn(data) {
  const displayDate = document.querySelector(".date");

  const date = new Date(data.current.time);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  displayDate.textContent = formattedDate;
}

function displayCurrentWeather(data) {
  const displayTemp = document.querySelector(".temp .value");
  const displayIcon = document.querySelector(".temp img");

  displayTemp.textContent = `${Number.parseInt(data.current.temperature_2m)}°`;
  displayIcon.src = getWeatherIcon(data.current.weathercode);
  displayIcon.alt = `Weather icon representing ${data.current.weathercode}`;
}

function displaymetric(data) {
  const displayApparentTemp = document.querySelector(".apparent-temp dd");
  const displayHumidity = document.querySelector(".humidity dd");
  const displayWindSpeed = document.querySelector(".wind-speed dd");
  const displayPrecipitation = document.querySelector(".precipitation dd");

  displayApparentTemp.textContent = `${Number.parseInt(data.current.apparent_temperature)}°`;
  displayHumidity.textContent = `${Number.parseInt(data.current.relative_humidity_2m)}%`;
  displayWindSpeed.textContent = `${Number.parseInt(data.current.wind_speed_10m)} ${unitsMenu.querySelector('input[name="wind-speed"]:checked').value}`;
  displayPrecipitation.textContent = `${Number.parseInt(data.current.precipitation)} ${unitsMenu.querySelector('input[name="precipitation"]:checked').value}`;
}

function displayForecastData(data) {
  const forecastList = document.querySelector(".forecast-list");
  forecastList.innerHTML = data.daily.time
    .map(
      (day, index) => `
    <li class="day">
      <span>${new Date(day).toLocaleDateString("en-US", { weekday: "short" })}</span>
      <img src="${getWeatherIcon(data.daily.weathercode[index])}" alt="Weather icon for ${day}" />
      <div class="day-details">
        <span>${Number.parseInt(data.daily.temperature_2m_max[index])}°</span>
        <span>${Number.parseInt(data.daily.temperature_2m_min[index])}°</span>
      </div>
    </li>
  `,
    )
    .join("");

  const hourlyData = getHourlyForDay(data.current.time, data);
  displayHourlyData(hourlyData);
  daysToggleHandler(data);
}

function getHourlyForDay(date, data) {
  const actualToday = new Date().toISOString().slice(0, 10);
  const today = date.slice(0, 10);
  let currentHour = new Date(date).getHours();
  if (currentHour >= 17 && actualToday === today) {
    currentHour = 16;
  } else if (actualToday !== today) {
    currentHour = 0;
  }

  const dayHours = data.hourly.time
    .filter((time) => time.slice(0, 10) === today)
    .slice(currentHour, currentHour + 8);
  const temperatureHours = data.hourly.temperature_2m
    .filter((_, index) => data.hourly.time[index].slice(0, 10) === today)
    .slice(currentHour, currentHour + 8);

  const weatherCodeHours = data.hourly.weathercode
    .filter((_, index) => data.hourly.time[index].slice(0, 10) === today)
    .slice(currentHour, currentHour + 8);
  return { dayHours, temperatureHours, weatherCodeHours };
}

function displayHourlyData(hourlyData) {
  const hourlyList = document.querySelector(".hourly-list");
  hourlyList.innerHTML = hourlyData.dayHours
    .map(
      (hour, index) => `
      <li>
        <img src="${getWeatherIcon(hourlyData.weatherCodeHours[index])}" alt="Weather icon for ${hour}" />
        <span>${new Date(hour).toLocaleTimeString("en-US", { hour: "numeric" })}</span>
        <span>${Number.parseInt(hourlyData.temperatureHours[index])}°</span>
      </li>
    `,
    )
    .join("");
}

function daysToggleHandler(data) {
  const daySelected = document.querySelector(".days-toggle span");
  daySelected.textContent = new Date(data.current.time).toLocaleDateString(
    "en-US",
    { weekday: "long" },
  );
  const days = data.daily.time.map((day) =>
    new Date(day).toLocaleDateString("en-US", { weekday: "long" }),
  );
  const dayButtons = daysMenu.querySelectorAll("button");
  dayButtons.forEach((button, index) => {
    button.textContent = days[index];
    button.onclick = () => {
      daySelected.textContent = days[index];
      daysMenu.setAttribute("hidden", "");
      const hourlyData = getHourlyForDay(data.daily.time[index], data);
      displayHourlyData(hourlyData);
    };
  });
}

async function searchHandler(e) {
  e.preventDefault();
  loading.removeAttribute("hidden");
  weatherContainer.setAttribute("hidden", "");
  error.setAttribute("hidden", "");

  const location = searchInput.value.trim();
  localStorage.setItem("location", location);
  currentLocation = location;
  if (location) {
    await fetchWeatherData(currentLocation);
    searchInput.value = "";
  } else {
    loading.setAttribute("hidden", "");
    errorMessage.textContent = "Please enter a location!";
    error.removeAttribute("hidden");
  }
}

searchForm.addEventListener("submit", searchHandler);
searchButton.addEventListener("click", searchHandler);
