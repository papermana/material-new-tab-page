const {
  ReduceStore,
} = require('flux/utils');
const Dispatcher = require('@js/dispatcher');
const init = require('@stores/AppsStore/appsStore.init');
const {
  AppsStoreState,
} = require('@stores/AppsStore/appsStore.dataTypes');


class AppsStore extends ReduceStore {
  getInitialState() {
    return new AppsStoreState();
  }

  reduce(state, action) {
    if (action.type === 'permissionsGranted') {
      if (action.data.apps) {
        init();
      }

      return state;
    }
    else if (action.type === 'permissionsRevoked') {
      if (action.data.apps) {
        return new AppsStoreState();
      }
      else {
        return state;
      }
    }
    else if (action.type === 'initAppsStore') {
      return state
      .set('apps', action.data.allApps)
      .set('favoriteApps', action.data.favoriteApps)
      .set('ready', true);
    }
    else {
      return state;
    }
  }
}


module.exports = new AppsStore(Dispatcher);
