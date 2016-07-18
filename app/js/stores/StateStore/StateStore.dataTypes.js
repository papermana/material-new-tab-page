const Immutable = require('immutable');


const StateStoreState = Immutable.Record({
  navStack: Immutable.Stack(),
  searchResults: Immutable.List(),
  ready: true,
});


module.exports = {
  StateStoreState,
};
