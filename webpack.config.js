/* eslint-env node */

const webpack = require('webpack');
const Copy = require('copy-webpack-plugin');


//  Get arguments passed to webpack from console/package.json:
//  This returns an array:
//  - first entry is the path to your node directory,
//  - second entry is the path to the webpack executable,
//  - every entry after that is an argument.
const args = process.argv.slice(2);

//  Find which mode we operate in: `dev` or `production`:
let mode = 'dev';

args.forEach(arg => {
  const match = (/--mode=(.*)/).exec(arg);

  if (match) {
    mode = match[1];
  }
});

//  Root directory of the project:
const root = process.cwd();


const config = {
  context: `${root}/app`,
  entry: {
    main: './js/main.jsx',
    backgroundPage: './js/backgroundPage.jsx',
  },
  output: {
    path: `${root}/dist`,
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.(jsx|js)$/,
        exclude: [/node_modules/, /__tests__/],
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
        },
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
  resolve: {
    root,
    alias: {
      '@root': 'app',
      '@js': 'app/js',
      '@stores': 'app/js/stores',
      '@components': 'app/js/components',
      '@utils': 'app/js/utils',
    },
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx'],
  },
  plugins: [
    new Copy([
      {
        from: 'index.html',
      },
      {
        from: 'backgroundPage.html',
      },
      {
        from: 'manifest.json',
      },
      {
        from: 'assets',
        to: 'assets',
      },
      {
        from: 'css',
        to: 'css',
      },
      {
        from: '_locales',
        to: '_locales',
      },
    ]),
  ],
};

if (mode === 'dev') {
  config.watch = true;
  config.debug = true;
  config.devtool = 'cheap-module-source-map';
}
else if (mode === 'production') {
  config.plugins.push(...[
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        sequences: true,
        properties: true,
        dead_code: true,
        drop_debugger: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        negate_iife: true,
        pure_getters: true,
        drop_console: true,
        unsafe: true,
        warnings: false,
      },
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ]);
}


module.exports = config;
