const {
  ReduceStore,
} = require('flux/utils');
const dispatcher = require('@js/dispatcher');
const {
  WeatherStoreState,
} = require('@stores/WeatherStore/WeatherStore.dataTypes');
const init = require('@stores/WeatherStore/WeatherStore.init');


class WeatherStore extends ReduceStore {
  getInitialState() {
    return new WeatherStoreState();
  }

  reduce(state, action) {
    if (action.type === 'permissionsGranted') {
      if (action.data.weather) {
        init(state);
      }

      return state;
    }
    else if (action.type === 'permissionsRevoked') {
      if (action.data.weather) {
        return new WeatherStoreState();
      }
      else {
        return state;
      }
    }
    else if (action.type === 'initWeatherStore') {
      return state
      .mergeDeep(action.data)
      .set('ready', true);
    }
    else {
      return state;
    }
  }
}


module.exports = new WeatherStore(dispatcher);
