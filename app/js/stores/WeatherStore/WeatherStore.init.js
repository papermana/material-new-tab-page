const Immutable = require('immutable');
const moment = require('moment');
const actionCreators = require('@js/actionCreators');
const storageHelpers = require('@utils/chromeStorageHelpers');


//  test
const city = 'Warsaw, PL';

function init() {
  //  We only return this promise for the purposes of testing:
  return Promise.all([getDataFromStorage(), getLocation()])
  .then(([state]) => {
    // Minimum period of time to wait before we load another forecast (in ms):
    const timeToWait = 1000 * 60 * 60 * 4;
    const lastChecked = state.get('lastChecked');

    if (lastChecked && Date.now() - lastChecked < timeToWait) {
      actionCreators.initWeatherStore(state);

      return undefined;
    }
    else {
      //  Return for testing:
      return getLocation()
      .then(location => fetchNewData(state, location))
      .then(state => {
        actionCreators.initWeatherStore(state);
        storageHelpers.setInStorage({
          weatherData: JSON.stringify(state.toJS()),
        });
      });
    }
  });
}

function getDataFromStorage() {
  return storageHelpers.getFromStorage('weatherData')
  .then(weatherData => {
    if (weatherData) {
      weatherData = Immutable.fromJS(JSON.parse(weatherData));

      const forecastMapped = weatherData.get('forecast')
      .map(entry => entry.update('date', moment));

      weatherData = weatherData.set('forecast', forecastMapped);

      return weatherData;
    }
    else {
      return new Immutable.Map();
    }
  });
}

function getLocation() {
  return getConfig()
  .then(config => {
    if (config.useGeolocation) {
      return getCoords();
    }
    else if (config.customLocation) {
      return config.customLocation;
    }
    else {
      return 'Warsaw, PL';
    }
  });
}

function getCoords() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => resolve(position.coords));
  });
}

function getConfig() {
  return storageHelpers.getFromStorage('config');
}

function fetchNewData(state, location) {
  const APPID = '8abe6b7721a64a5e06660f56047d1f59';
  const BASEURL = 'http://api.openweathermap.org/data/2.5/';
  let query;

  if (typeof location === 'string') {
    if (/\d/.test(location)) {
      query = `id=${location}`;
    }
    else {
      query = `q=${location}`;
    }
  }
  else {
    query = `lat=${location.latitude}&lon=${location.longitude}`;
  }

  const today = fetch(`${BASEURL}weather?${query}&APPID=${APPID}`)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    else {
      throw new Error('Failed to receive weather data for today');
    }
  });

  const forecast = fetch(`${BASEURL}forecast?${query}&APPID=${APPID}`)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    else {
      throw new Error('Failed to receive weather forecast');
    }
  });

  return Promise.all([today, forecast])
  .then(formatData)
  .then(data => {
    return state
    .mergeDeep(data)
    .set('lastChecked', Date.now());
  });
}

function formatData([today, forecast]) {
  const weather = {
    location: today.name,
    today: {
      temp: today.main.temp,
      status: today.weather[0].main,
      icon: today.weather[0].icon,
    },
    forecast: [],
  };

  const now = moment().startOf('day');
  let currentDay = 0;

  forecast.list
  .map(entry => ({
    date: moment.utc(entry.dt_txt),
    weather: {
      temp: entry.main.temp,
      status: entry.weather[0].main,
      icon: entry.weather[0].icon,
    },
  }))
  .filter(entry => isDay(entry.date.hour()) || isNight(entry.date.hour()))
  .forEach(entry => {
    if (isDay(entry.date.hour()) && entry.date.date() !== now.date()) {
      currentDay++;
    }

    if (!weather.forecast[currentDay]) {
      weather.forecast[currentDay] = {
        date: now.clone().add(currentDay, 'd'),
      };
    }

    const time = isDay(entry.date.hour()) ? 'day' : 'night';

    weather.forecast[currentDay][time] = entry.weather;
  });

  weather.forecast = weather.forecast.slice(0, 5);

  return weather;
}

//  The forecast is a list of objects containing weather data,
//  all set 3 hours apart.
//  We only want one reading for the day and one for the night, so we'll pick
//  those that have hours closest to desired. The first item in the forecast is
//  from as recently as possible (e.g. if it's fetched on 16:25, list[0] is going
//  to be for 16:00), and subsequent forecasts are set exactly 3 hours
//  from each other. Therefore, we're not guaranteed to have a forecast
//  for 12:00, for example. We can only approximate.
function isDay(hour) {
  return hour === 11 || hour === 12 || hour === 13;
}

function isNight(hour) {
  return hour === 23 || hour === 0 || hour === 1;
}


module.exports = init;
