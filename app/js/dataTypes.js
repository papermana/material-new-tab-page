const Immutable = require('immutable');


const TileElement = Immutable.Record({
  id: undefined,
  name: undefined,
  description: undefined,
  url: undefined,
  icon: undefined,
});


module.exports = {
  TileElement,
};
