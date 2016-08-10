const Immutable = require('immutable');
const storageHelpers = require('@utils/chromeStorageHelpers');
const actionCreators = require('@js/actionCreators');
const {
  SearchEngine,
  Features: FeaturesRecord,
} = require('@stores/ConfigStore/ConfigStore.dataTypes');
const {
  searchEngines: searchEnginesList,
} = require('@js/constants');


function findEngine(name) {
  const engine = searchEnginesList.find(engine => engine.name === name);

  return new SearchEngine(engine);
}

function init() {
  return storageHelpers.getFromStorage('config')
  .then(config => {
    if (!config) {
      config = {
        features: {},
        searchEngine: 'Google',
      };
    }

    return {
      features: new FeaturesRecord(config.features),
      searchEngine: findEngine(config.searchEngine),
      useGeolocation: config.useGeolocation || false,
      customLocation: config.customLocation,
      tempUnits: config.tempUnits || 'celsius',
    };
  })
  .then(config => actionCreators.initConfigStore(config));
}

function changePermissions(newFeatures, oldFeatures) {
  const permissions = {
    apps: {
      permissions: ['management'],
    },
    topSites: {
      permissions: ['topSites'],
      origins: ['chrome://favicon/*'],
    },
    bookmarks: {
      permissions: ['bookmarks'],
    },
    weather: {
      origins: ['http://api.openweathermap.org/*'],
    },
  };

  let grantPermissions = Immutable.Map();
  let revokePermissions = Immutable.Map();

  newFeatures = Immutable.fromJS(newFeatures);
  oldFeatures = Immutable.fromJS(oldFeatures);

  oldFeatures.forEach((value, key) => {
    if (value === false && newFeatures.get(key) === true) {
      grantPermissions = grantPermissions.set(key, true);
    }
    else if (value === true && newFeatures.get(key) === false) {
      revokePermissions = revokePermissions.set(key, true);
    }
  });

  const newFeaturesCopy = newFeatures;

  const promises = [];

  grantPermissions.forEach((value, key) => {
    const p = new Promise((resolve, reject) => {
      chrome.permissions.request(permissions[key], granted => resolve(granted));
    })
    .then(granted => {
      if (!granted) {
        grantPermissions = grantPermissions.delete(key);
        newFeatures = newFeatures.set(key, false);
      }

      return;
    });

    promises.push(p);
  });
  revokePermissions.forEach((value, key) => {
    const p = new Promise((resolve, reject) => {
      chrome.permissions.remove(permissions[key], removed => resolve(removed));
    })
    .then(removed => {
      if (!removed) {
        revokePermissions = revokePermissions.delete(key);
        newFeatures = newFeatures.set(key, true);
      }

      return;
    });

    promises.push(p);
  });

  //  We're only returning this for the purposes of testing:
  return Promise.all(promises)
  .then(() => {
    setTimeout(() => {
      if (grantPermissions.size > 0) {
        actionCreators.permissionsGranted(grantPermissions.toJS());
      }

      if (revokePermissions.size > 0) {
        actionCreators.permissionsRevoked(revokePermissions.toJS());
      }

      if (newFeatures !== newFeaturesCopy) {
        actionCreators.setConfig({
          features: newFeatures.toJS(),
        });
      }
    }, 0);
  });
}

function setConfig(changes, state) {
  let searchEngine = state.searchEngine.name;

  if (changes.features) {
    changePermissions(changes.features, state.features);

    changes.features = Immutable.fromJS(changes.features);
    state = state.set('features', Immutable.fromJS(state.features));
    state = state.mergeDeepIn(['features'], changes.features);
  }

  if (changes.searchEngine) {
    state = state.set('searchEngine', findEngine(changes.searchEngine));
    searchEngine = changes.searchEngine;
  }

  if (changes.tempUnits) {
    state = state.set('tempUnits', changes.tempUnits);
  }

  if (changes.useGeolocation) {
    state = state.set('useGeolocation', changes.useGeolocation);
  }

  if (changes.customLocation) {
    state = state.set('customLocation', changes.customLocation);
  }

  if (changes.useGeolocation || changes.customLocation) {
    //  Refetch the weather data:
    storageHelpers.removeFromStorage('weatherData');
  }

  storageHelpers.setInStorage({
    config: {
      features: state.toJS().features,
      searchEngine,
      useGeolocation: changes.useGeolocation,
      customLocation: changes.customLocation,
      tempUnits: changes.tempUnits,
    },
  });

  return state;
}


module.exports = {
  init,
  setConfig,
  __tests__: {
    changePermissions,
  },
};
