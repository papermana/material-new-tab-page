const React = require('react');
const {
  FlatButton,
} = require('material-ui');
const consts = require('@js/constants');


class Tile extends React.Component {
  clickFunc(app) {
    if (app.has('url') && app.url !== '') {
      window.location = app.url;
    }
    else {
      chrome.management.launchApp(app.id);
    }
  }

  render() {
    return <FlatButton style={styles.tile}
      onClick={() => this.clickFunc(this.props.app)} >
      <img style={styles.tileImg}
        src={this.props.app.icon} />
      <p style={styles.tileName}>
        {this.props.app.name}
      </p>
    </FlatButton>;
  }
}

Tile.propTypes = {
  app: consts.propTypes.TILE.isRequired,
};

const styles = {
  tile: {
    display: 'inline-flex',
    width: 1 / 4 * 100 + '%',
    height: 'auto',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
  },
  tileImg: {
    width: 64,
    height: 64,
    margin: '16px 0',
  },
  tileName: {
    width: '90%',
    height: '2.1em',
    lineHeight: '1em',
    fontSize: 14,
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
};


module.exports = Tile;
