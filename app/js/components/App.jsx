const React = require('react');
const {
  Mixin: fluxMixin,
} = require('flux/utils');
const AppUi = require('@components/AppUi');
const StateStore = require('@stores/StateStore');
const ConfigStore = require('@stores/ConfigStore');
const AppsStore = require('@stores/AppsStore');
const TopSitesStore = require('@stores/TopSitesStore');
const WeatherStore = require('@stores/WeatherStore');


/**
  This function streamlines the process of extracting data from stores. Each store should have a `ready` property (which is boolean) for this to work.
  @private
  @param {Object} store - The store that we want to use
  @param {string} [property=undefined] - In canse we want to extract just a single property from the store, rather than the whole state, we can add the name of that property in the string form
  @returns {*} - Whatever was in the store or under the given property
*/
function isStoreReady(store, property) {
  const state = store.getState();

  if (!state.get('ready')) {
    return undefined;
  }

  if (property) {
    return state.get(property);
  }
  else {
    return state.remove('ready');
  }
}

//  We're using a Flux mixin and an old school `React.createClass()` method here, because at the time of writing this the official Flux library doesn't seem to work with untraspiled ES6 classes.
//  If this ever gets fixed, the following might be changed to use a class:
const AppContainer = React.createClass({
  mixins: [
    fluxMixin([
      StateStore,
      ConfigStore,
      AppsStore,
      TopSitesStore,
      WeatherStore,
    ]),
  ],
  statics: {
    calculateState(prevState) {
      return {
        state: isStoreReady(StateStore),
        config: isStoreReady(ConfigStore),
        apps: isStoreReady(AppsStore, 'apps'),
        favoriteApps: isStoreReady(AppsStore, 'favoriteApps'),
        topSites: isStoreReady(TopSitesStore, 'sites'),
        weather: isStoreReady(WeatherStore),
      };
    },
  },
  render() {
    return <AppUi model={this.state} />;
  },
});


module.exports = AppContainer;
