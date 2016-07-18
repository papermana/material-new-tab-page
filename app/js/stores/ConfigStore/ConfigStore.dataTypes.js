const Immutable = require('immutable');


const ConfigStoreState = Immutable.Record({
  features: undefined,
  searchEngine: undefined,
  ready: false,
});


module.exports = {
  ConfigStoreState,
};
