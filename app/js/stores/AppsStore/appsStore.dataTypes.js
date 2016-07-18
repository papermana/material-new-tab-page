const Immutable = require('immutable');


const AppsStoreState = Immutable.Record({
  apps: undefined,
  favoriteApps: undefined,
  ready: false,
});

const App = Immutable.Record({
  id: undefined,
  name: undefined,
  description: undefined,
  url: undefined,
  icon: undefined,
});


module.exports = {
  AppsStoreState,
  App,
};
