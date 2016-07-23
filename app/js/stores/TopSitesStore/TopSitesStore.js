const Immutable = require('immutable');
const {
  ReduceStore,
} = require('flux/utils');
const Dispatcher = require('@js/dispatcher');
const init = require('@stores/TopSitesStore/TopSitesStore.init');
const {
  TopSitesStoreState,
} = require('@stores/TopSitesStore/TopSitesStore.dataTypes');


class TopSitesStore extends ReduceStore {
  getInitialState() {
    return new TopSitesStoreState();
  }

  reduce(state, action) {
    if (action.type === 'permissionsGranted') {
      if (action.data.topSites) {
        init();
      }

      return state;
    }
    else if (action.type === 'permissionsRevoked') {
      if (action.data.topSites) {
        return new TopSitesStoreState();
      }
      else {
        return state;
      }
    }
    else if (action.type === 'initTopSitesStore') {
      return state
      .set('sites', Immutable.fromJS(action.data))
      .set('ready', true);
    }
    else {
      return state;
    }
  }
}


module.exports = new TopSitesStore(Dispatcher);
