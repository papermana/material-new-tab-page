const React = require('react');
const AppBar = require('material-ui/AppBar').default;
const IconButton = require('material-ui/IconButton').default;
const IconMenu = require('material-ui/IconMenu').default;
const MenuItem = require('material-ui/MenuItem').default;
const Paper = require('material-ui/Paper').default;
const NavigationMoreVert = require('material-ui/svg-icons/navigation/more-vert').default;
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
    <NavigationMoreVert color="white" />
  </IconButton>;
  const styles = {
    menuItem: {
      cursor: 'pointer',
    },
  };

  return <IconMenu
    iconButtonElement={button}
    anchorOrigin={origin}
    targetOrigin={origin}
    desktop={true} >
    <MenuItem style={styles.menuItem}
      primaryText="Settings"
      onClick={() => actionCreators.goTo('settings')} />
    <MenuItem style={styles.menuItem}
      primaryText="About"
      onClick={() => actionCreators.goTo('about')} />
  </IconMenu>;
}

function Bar(props) {
  const styles = {
    bar: {
      backgroundColor: HEADER_COLOR,
      transform: `translate3D(0, ${props.offset}px, 0)`,
      transition: 'none',
      zIndex: 110,
    },
  };

  return <AppBar style={styles.bar}
    zDepth={0}
    showMenuIconButton={false}
    iconElementRight={<Menu />} />;
}

Bar.propTypes = {
  offset: React.PropTypes.number.isRequired,
};

class Header extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      offset: 0,
    };

    this.scrollFuncBuffer;
  }

  componentDidMount() {
    this._mainWrapperElement = document.querySelector('#main-wrapper');

    this._mainWrapperElement.addEventListener('scroll', this.scrollFunc.bind(this));

    this.scrollFunc();
  }

  componentWillUnmount() {
    this._mainWrapperElement.removeEventListener('scroll', this.scrollFunc.bind(this));
  }

  scrollFunc() {
    if (this.scrollFuncBuffer) {
      window.cancelAnimationFrame(this.scrollFuncBuffer);
    }

    this.scrollFuncBuffer = window.requestAnimationFrame(this._scrollFuncInner.bind(this));
  }

  _scrollFuncInner() {
    const offset = this._mainWrapperElement.scrollTop >= consts.HEADER_HEIGHT - 64
      ? consts.HEADER_HEIGHT - 64
      : this._mainWrapperElement.scrollTop;

    if (offset !== this.state.offset) {
      this.setState({
        offset,
      });
    }
  }

  render() {
    const styles = {
      wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: consts.HEADER_HEIGHT,
        backgroundColor: HEADER_COLOR,
        position: 'fixed',
        width: '100%',
        transform: `translate3D(0, ${-this.state.offset}px, 0)`,
        transition: 'none',
        zIndex: 100,
      },
      searchBar: {
        paddingBottom: (64 - consts.SEARCHBAR_HEIGHT) / 2,
        //  Full width sans icons on the left and right of the app bar:
        maxWidth: 'calc(100% - 64px - 64px)',
        zIndex: 120,
      },
    };

    return <Paper style={styles.wrapper}
      rounded={false}
      zDepth={this.state.offset >= consts.HEADER_HEIGHT - 64 ? 2 : 1} >
      <Bar offset={this.state.offset} />
      <SearchBar model={this.props.model} style={styles.searchBar} />
    </Paper>;
  }
}

Header.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};


module.exports = Header;
