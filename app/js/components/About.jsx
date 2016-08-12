const React = require('react');
const Dialog = require('material-ui/Dialog').default;
const FlatButton = require('material-ui/FlatButton').default;
const actionCreators = require('@js/actionCreators');
const manifest = require('@root/manifest.json');
const _ = chrome.i18n.getMessage;


class About extends React.PureComponent {
  exit() {
    actionCreators.goBack();
  }

  render() {
    const buttons = [
      <FlatButton label={_('button_close')}
        onClick={this.exit.bind(this)} />,
    ];

    return <Dialog open={true}
      title={_('about_title')}
      actions={buttons}
      autoScrollBodyContent
      onRequestClose={this.exit.bind(this)} >
      <div style={styles.content} >
        <h1>{_('app_name')}</h1>
        <h2>{_('app_description')}</h2>
        <h3>{_('about_version', manifest.version)}</h3>
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
