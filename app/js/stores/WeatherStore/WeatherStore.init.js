const Immutable = require('immutable');
const actionCreators = require('@js/actionCreators');


//  test
const city = 'Warsaw, PL';

function init(state) {
  // Minimum period of time to wait before we load another forecast (in ms):
  const timeToWait = 1000 * 60 * 60 * 4;
  const lastChecked = state.lastChecked;
  const APPID = '8abe6b7721a64a5e06660f56047d1f59';
  const BASEURL = 'http://api.openweathermap.org/data/2.5/';

  if (lastChecked && Date.now() - lastChecked < timeToWait) {
    actionCreators.initWeatherStore(state);

    return;
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

  //  We're assigning this only for the purposes of testing:
  const test = Promise.all([today, forecast])
  .then(data => {
    state = state
    .set('lastChecked', Date.now())
    .set('today', data[0])
    .set('forecast', data[1]);

    actionCreators.initWeatherStore(state);
  });

  window.test && window.test(test);
}


module.exports = init;
