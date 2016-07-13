const React = require('react');
const Immutable = require('immutable');


const constants = {};

constants.propTypes = {
  MODEL: React.PropTypes.shape({

  }),
  CHILDREN: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(React.PropTypes.node),
    React.PropTypes.node,
  ]),
};


module.exports = constants;
