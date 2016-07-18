const Immutable = require('immutable');
const {
  TileElement,
} = require('@js/dataTypes');


const AppsStoreState = Immutable.Record({
  apps: undefined,
  favoriteApps: undefined,
  ready: false,
});

const App = TileElement;


module.exports = {
  AppsStoreState,
  App,
};
