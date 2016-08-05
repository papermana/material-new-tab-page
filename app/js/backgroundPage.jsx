const React = require('react');
const ReactDomServer = require('react-dom/server');
const injectTapEventPlugin = require('react-tap-event-plugin');
const App = require('@components/App');

document.addEventListener('DOMContentLoaded', () => {
  //  Required by Material-UI:
  injectTapEventPlugin();

  const markup = ReactDomServer.renderToString(<App />);

  document.body.innerHTML = markup;
});
