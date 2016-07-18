const Immutable = require('immutable');


const AppsStoreState = Immutable.Record({
  apps: undefined,
  favoriteApps: undefined,
  ready: false,
});


module.exports = AppsStoreState;
