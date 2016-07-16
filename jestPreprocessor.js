const config = require('./webpack.config.js');

module.exports = require('jest-alias-preprocessor')(config);
