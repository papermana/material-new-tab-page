const {
  ReduceStore,
} = require('flux/utils');
const dispatcher = require('@js/dispatcher');
const utils = require('@stores/StateStore/StateStore.utils');
const {
  StateStoreState,
} = require('@stores/StateStore/StateStore.dataTypes');


class StateStore extends ReduceStore {
  getInitialState() {
    return new StateStoreState();
  }

  reduce(state, action) {
    if (action.type === 'goTo') {
      return state
      .set('navStack', state.navStack.push(action.data));
    }
    else if (action.type === 'goBack') {
      return state
      .set('navStack', state.navStack.pop());
    }
    else if (action.type === 'setSearchValue') {
      utils.searchFunc(action.data);

      return state;
    }
    else if (action.type === 'setSearchResults') {
      return state
      .set('searchResults', action.data);
    }
    else {
      return state;
    }
  }
}


module.exports = new StateStore(dispatcher);
