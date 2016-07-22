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
  entry: './js/main.jsx',
  output: {
    path: `${root}/dist`,
    filename: 'app.bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.(jsx|js)$/,
        exclude: [/node_modules/, /__tests__/],
        loader: 'babel-loader',
        query: {
          presets: ['react'],
        },
      },
    ],
  },
  resolve: {
    root,
    alias: {
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
        from: 'manifest.json',
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
