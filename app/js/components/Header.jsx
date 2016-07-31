const React = require('react');
const reactCss = require('reactcss').default;
const {
  AppBar,
  IconButton,
  IconMenu,
  MenuItem,
  Paper,
} = require('material-ui');
const {
  NavigationMoreVert,
} = require('material-ui/svg-icons');
const materialColors = require('material-ui/styles/colors');
const actionCreators = require('@js/actionCreators');
const consts = require('@js/constants');
const SearchBar = require('@components/SearchBar');

const HEADER_COLOR = materialColors.blue500;

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

function Bar(props) {
  const styles = {
    bar: {
      backgroundColor: HEADER_COLOR,
    },
  };

  return <AppBar style={styles.bar}
    zDepth={0}
    showMenuIconButton={false}
    iconElementRight={<Menu />} />;
}

function Header(props) {
  const styles = {
    wrapper: {
      height: consts.HEADER_HEIGHT,
      backgroundColor: HEADER_COLOR,
    },
  };

  return <Paper style={styles.wrapper}
    rounded={false} >
    <Bar />
    <SearchBar model={props.model} />
  </Paper>;
}

Header.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};

const styles = reactCss({
  default: {
    menuItem: {
      cursor: 'pointer',
    },
  },
});


module.exports = Header;
