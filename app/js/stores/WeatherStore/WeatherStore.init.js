const Immutable = require('immutable');
const actionCreators = require('@js/actionCreators');
const storageHelpers = require('@utils/chromeStorageHelpers');


//  test
const city = 'Warsaw, PL';

function init() {
  //  We only return this promise for the purposes of testing:
  return storageHelpers.getFromStorage('weatherData')
  .then(weatherData => {
    if (weatherData) {
      return weatherData;
    }
    else {
      return new Immutable.Map();
    }
  })
  .then(state => {
    // Minimum period of time to wait before we load another forecast (in ms):
    const timeToWait = 1000 * 60 * 60 * 4;
    const lastChecked = state.get('lastChecked');
    const APPID = '8abe6b7721a64a5e06660f56047d1f59';
    const BASEURL = 'http://api.openweathermap.org/data/2.5/';

    if (lastChecked && Date.now() - lastChecked < timeToWait) {
      actionCreators.initWeatherStore(state);

      return undefined;
    }

    const today = fetch(`${BASEURL}weather?q=${city}&APPID=${APPID}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      else {
        throw new Error('Failed to receive weather data for today');
      }
    })
    .then(response => Immutable.fromJS(response));

    const forecast = fetch(`${BASEURL}forecast?q={$city}&APPID=${APPID}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      else {
        throw new Error('Failed to receive weather forecast');
      }
    })
    .then(response => Immutable.fromJS(response));

    return Promise.all([today, forecast])
    .then(([today, forecast]) => {
      state = state
      .set('lastChecked', Date.now())
      .set('today', today)
      .set('forecast', forecast);

      actionCreators.initWeatherStore(state);

      return state;
    })
    .then(state => {
      storageHelpers.setInStorage({
        weatherData: state,
      });
    });
  });
}


module.exports = init;
