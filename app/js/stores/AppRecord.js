const Immutable = require('immutable');


const App = Immutable.Record({
  id: undefined,
  name: undefined,
  description: undefined,
  url: undefined,
  icon: undefined,
});


module.exports = App;
