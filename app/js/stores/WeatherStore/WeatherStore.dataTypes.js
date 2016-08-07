const Immutable = require('immutable');


const WeatherStoreState = Immutable.Record({
  lastChecked: undefined,
  location: undefined,
  today: undefined,
  forecast: undefined,
  ready: false,
});


module.exports = {
  WeatherStoreState,
};
