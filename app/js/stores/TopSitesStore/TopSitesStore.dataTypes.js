const Immutable = require('immutable');
const {
  TileElement,
} = require('@js/dataTypes');


const TopSitesStoreState = Immutable.Record({
  sites: undefined,
  ready: false,
});

const TopSite = TileElement;


module.exports = {
  TopSitesStoreState,
  TopSite,
};
