const Immutable = require('immutable');
const {
  ReduceStore,
} = require('flux/utils');
const Dispatcher = require('@js/dispatcher');
const init = require('@stores/AppsStore/AppsStore.init');
const {
  AppsStoreState,
} = require('@stores/AppsStore/AppsStore.dataTypes');


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
      .set('apps', Immutable.fromJS(action.data.allApps))
      .set('favoriteApps', Immutable.fromJS(action.data.favoriteApps))
      .set('ready', true);
    }
    else {
      return state;
    }
  }
}


module.exports = new AppsStore(Dispatcher);
