const Immutable = require('immutable');


const WeatherStoreState = Immutable.Record({
  lastChecked: undefined,
  today: undefined,
  forecast: undefined,
  ready: false,
});


module.exports = {
  WeatherStoreState,
};
