const Immutable = require('immutable');


const ConfigStoreState = Immutable.Record({
  features: undefined,
  searchEngine: undefined,
  tempUnits: 'celsius',
  ready: false,
});

const Features = Immutable.Record({
  apps: false,
  topSites: false,
  bookmarks: false,
  weather: false,
});

const SearchEngine = Immutable.Record({
  name: undefined,
  url: undefined,
});


module.exports = {
  ConfigStoreState,
  Features,
  SearchEngine,
};
