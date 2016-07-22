const React = require('react');
const Immutable = require('immutable');


const constants = {};

constants.propTypes = {
  MODEL: React.PropTypes.shape({
    state: React.PropTypes.instanceOf(Immutable.Record),
    config: React.PropTypes.instanceOf(Immutable.Record),
    apps: React.PropTypes.instanceOf(Immutable.Record),
    favoriteApps: React.PropTypes.instanceOf(Immutable.Record),
    topSites: React.PropTypes.instanceOf(Immutable.Record),
    weather: React.PropTypes.instanceOf(Immutable.Record),
  }),
  CHILDREN: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(React.PropTypes.node),
    React.PropTypes.node,
  ]),
};

constants.searchEngines = [
  {
    name: 'Google',
    url: 'https://google.com/search?q=',
  },
  {
    name: 'Bing',
    url: 'https://bing.com/search?q=',
  },
  {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
  },
];


module.exports = constants;
