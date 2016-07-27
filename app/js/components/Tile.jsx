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
    const size = this.props.size === 'large' ? 256
      : this.props.size === 'medium' ? 128
      : this.props.size === 'small' ? 96
      : this.props.size;
    const styles = {
      tile: {
        display: 'inline-flex',
        width: size,
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        //  Overwrite FlatButton's default styling, because it causes some issues:
        lineHeight: '1em',
      },
      tileImg: {
        width: size / 2,
        height: size / 2,
        margin: size / 4,
        marginBottom: size / 8,
      },
      tileName: {
        width: size,
        height: '2.1em',
        lineHeight: '1em',
        fontSize: 14,
        margin: 4,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'center',
      },
    };


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
  size: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.oneOf([
      'small',
      'medium',
      'large',
    ]),
  ]).isRequired,
};


module.exports = Tile;
