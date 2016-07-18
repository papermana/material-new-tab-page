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
  'permissionsGranted',
  'permissionsRevoked',
  'initAppsStore',
  'initTopSitesStore',
  'goTo',
  'goBack',
  'setSearchValue',
  'setSearchResults',
]
.forEach(string => createAction(string));


module.exports = actionCreators;
