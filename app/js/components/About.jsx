const React = require('react');
const Dialog = require('material-ui/Dialog').default;
const FlatButton = require('material-ui/FlatButton').default;
const actionCreators = require('@js/actionCreators');
const manifest = require('@root/manifest.json');


class About extends React.PureComponent {
  exit() {
    actionCreators.goBack();
  }

  render() {
    const buttons = [
      <FlatButton label="Close"
        onClick={this.exit.bind(this)} />,
    ];

    return <Dialog open={true}
      title="About"
      actions={buttons}
      autoScrollBodyContent
      onRequestClose={this.exit.bind(this)} >
      <div style={styles.content} >
        <h1>{manifest.name}</h1>
        <h2>{manifest.description}</h2>
        <h3>Version {manifest.version}</h3>
      </div>
    </Dialog>;
  }
}

const styles = {
  content: {
    textAlign: 'center',
  },
};


module.exports = About;
