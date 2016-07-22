const React = require('react');
const ReactDom = require('react-dom');
const injectTapEventPlugin = require('react-tap-event-plugin');
const App = require('@components/App');

document.addEventListener('DOMContentLoaded', () => {
  //  Required by Material-UI:
  injectTapEventPlugin();

  ReactDom.render(<App />, document.getElementById('react'));
});
