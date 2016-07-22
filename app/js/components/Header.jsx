const React = require('react');
const reactCss = require('reactcss').default;
const {
  AppBar,
  IconButton,
  IconMenu,
  MenuItem,
} = require('material-ui');
const {
  NavigationMoreVert,
} = require('material-ui/svg-icons');
const actionCreators = require('@js/actionCreators');

function Menu(props) {
  const origin = {
    vertical: 'top',
    horizontal: 'right',
  };
  const button = <IconButton>
    <NavigationMoreVert />
  </IconButton>;

  return <IconMenu
    iconButtonElement={button}
    anchorOrigin={origin}
    targetOrigin={origin}
    desktop={true} >
    <MenuItem style={styles.menuItem}
      primaryText="Settings"
      onClick={() => actionCreators.goTo('settings')} />
  </IconMenu>;
}

function Header(props) {
  return <AppBar
    showMenuIconButton={false}
    iconElementRight={<Menu />} />;
}

const styles = reactCss({
  default: {
    menuItem: {
      cursor: 'pointer',
    },
  },
});


module.exports = Header;
