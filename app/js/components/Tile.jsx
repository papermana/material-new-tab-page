const React = require('react');
const FlatButton = require('material-ui/FlatButton').default;
const consts = require('@js/constants');


function clickFunc(app) {
  if (app.has('url') && app.url !== '') {
    window.location = app.url;
  }
  else {
    chrome.management.launchApp(app.id);
  }
}

function Tile(props) {
  const size = props.size === 'large' ? 256
    : props.size === 'medium' ? 128
    : props.size === 'small' ? 96
    : props.size;
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
      width: size - 8,
      height: '2.1em',
      lineHeight: '1em',
      fontSize: 14,
      margin: 4,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'center',
    },
  };

  if (props.smallIcons) {
    styles.tileImg.width = 16;
    styles.tileImg.height = 16;
    styles.tileImg.margin = (size - 16) / 2;
    styles.tileImg.marginBottom = (size * 0.875) - 16 - ((size - 16) / 2);
  }


  return <FlatButton style={styles.tile}
    title={props.app.description}
    onClick={() => clickFunc(props.app)} >
    <img style={styles.tileImg}
      src={props.app.icon} />
    <p style={styles.tileName}>
      {props.app.name}
    </p>
  </FlatButton>;
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
  smallIcons: React.PropTypes.bool,
};


module.exports = Tile;
