const React = require('react');
const ReactDom = require('react-dom');

class App extends React.Component {
  render() {
    return <div>
      <p>Some text</p>
    </div>;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDom.render(<App />, document.body);
});
