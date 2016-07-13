const Dispatcher = require('@js/dispatcher.js');


function createAction(name) {
  actionCreators[name] = data => {
    Dispatcher.dispatch({
      type: name,
      data,
    });
  };
}

const actionCreators = {};

[

]
.forEach(string => createAction(string));


module.exports = actionCreators;
