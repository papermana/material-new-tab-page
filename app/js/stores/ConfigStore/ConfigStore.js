const {
  ReduceStore,
} = require('flux/utils');
const dispatcher = require('@js/dispatcher');
const actionCreators = require('@js/actionCreators');
const utils = require('@stores/ConfigStore/ConfigStore.utils');
const {
  ConfigStoreState,
} = require('@stores/ConfigStore/ConfigStore.dataTypes');


class ConfigStore extends ReduceStore {
  getInitialState() {
    return new ConfigStoreState();
  }

  reduce(state, action) {
    if (action.type === 'initConfigStore') {
      setTimeout(() => {
        actionCreators.permissionsGranted(action.data.features);
      }, 0);

      return state
      .merge(action.data)
      // .set('features', action.data.features)
      // .set('searchEngine', action.data.searchEngine)
      .set('ready', true);
    }
    else if (action.type === 'setConfig') {
      return state
      .merge(utils.setConfig(action.data, state));
    }
    else {
      return state;
    }
  }
}


utils.init();

module.exports = new ConfigStore(dispatcher);
