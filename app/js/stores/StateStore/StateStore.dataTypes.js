const Immutable = require('immutable');
const {
  TileElement,
} = require('@js/dataTypes');


const StateStoreState = Immutable.Record({
  navStack: Immutable.Stack(),
  searchResults: Immutable.List(),
  ready: true,
});

const SearchElement = TileElement;


module.exports = {
  StateStoreState,
  SearchElement,
};
