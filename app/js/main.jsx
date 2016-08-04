const React = require('react');
const ReactDom = require('react-dom');
const injectTapEventPlugin = require('react-tap-event-plugin');
const App = require('@components/App');

window.addEventListener('load', () => {
  //  Required by Material-UI:
  injectTapEventPlugin();

  ReactDom.render(<App />, document.getElementById('react'));
});
