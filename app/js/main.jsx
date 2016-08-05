const injectTapEventPlugin = require('react-tap-event-plugin');

document.addEventListener('DOMContentLoaded', () => {
  //  Required by Material-UI:
  injectTapEventPlugin();

  const backgroundPage = chrome.extension.getBackgroundPage();
  const backgroundPageNode = backgroundPage.document.body.cloneNode(true);
  const reactParentNode = document.getElementById('react');

  reactParentNode.style.pointerEvents = 'none';
  reactParentNode.appendChild(backgroundPageNode);

  require.ensure(['react', 'react-dom', './components/App'], require => {
    const React = require('react');
    const ReactDom = require('react-dom');
    const App = require('./components/App');

    ReactDom.render(<App />, reactParentNode);
    reactParentNode.style.pointerEvents = 'auto';
  });
});
