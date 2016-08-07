const React = require('react');
const Immutable = require('immutable');


const constants = {};

constants.HEADER_HEIGHT = 4 * 64;
constants.SEARCHBAR_HEIGHT = 52;
constants.cardWidth = tileSize => {
  tileSize = tileSize === 'small' ? 96 : 128;

  return tileSize * 4 + 16;
};
constants.cardMargin = 16;

constants.propTypes = {
  MODEL: React.PropTypes.shape({
    state: React.PropTypes.instanceOf(Immutable.Record),
    config: React.PropTypes.instanceOf(Immutable.Record),
    apps: React.PropTypes.instanceOf(Immutable.List),
    favoriteApps: React.PropTypes.instanceOf(Immutable.List),
    topSites: React.PropTypes.instanceOf(Immutable.List),
    weather: React.PropTypes.instanceOf(Immutable.Record),
  }),
  DIMENSIONS: React.PropTypes.instanceOf(Immutable.Record),
  TILE: React.PropTypes.instanceOf(Immutable.Record),
  CHILDREN: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(React.PropTypes.node),
    React.PropTypes.node,
  ]),
  STYLE: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.arrayOf(React.PropTypes.object),
  ]),
};

//  Desktop breakpoints accorting to Material Design spec:
//  Values are maximum widths in pixels.
//  xsmall is supposed to use 4 columns,
//  small -- 8, and any larger than that -- 12.
constants.breakpoints = {
  xsmall: 600,
  small: 840,
  medium: 1280,
  large: 1920,
  xlarge: Infinity,
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
