const React = require('react');
const consts = require('@js/constants');
const {
  AppBar,
  IconButton,
} = require('material-ui');
const {
  NavigationArrowBack,
} = require('material-ui/svg-icons');
const actionCreators = require('@js/actionCreators');
const Tile = require('@components/Tile');


const arrowBack = <IconButton
  onClick={() => actionCreators.goBack()} >
  <NavigationArrowBack color="black" />
</IconButton>;

class AllApps extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scrolled: false,
    };

    this._scrollFuncBuffer;
  }

  componentDidMount() {
    document.body.style.overflowY = 'hidden';

    this.refs.tilesDisplayWrapper.addEventListener('scroll', this.scrollFunc.bind(this));
  }

  componentWillUnmount() {
    document.body.style.overflowY = null;

    this.refs.tilesDisplayWrapper.removeEventListener('scroll', this.scrollFunc.bind(this));
  }

  scrollFunc() {
    if (this.scrollFuncBuffer) {
      window.cancelAnimationFrame(this.scrollFuncBuffer);
    }

    this.scrollFuncBuffer = window.requestAnimationFrame(this._scrollFuncInner.bind(this));
  }

  _scrollFuncInner() {
    const scroll = this.refs.tilesDisplayWrapper.scrollTop;

    if (this.state.scrolled && scroll === 0) {
      this.setState({
        scrolled: false,
      });
    }
    else if (!this.state.scrolled && scroll > 0) {
      this.setState({
        scrolled: true,
      });
    }
  }

  getStyles() {
    return {
      wrapper: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'white',
        overflow: 'hidden',
        zIndex: 200,
      },
      appBar: {
        backgroundColor: 'white',
      },
      tilesDisplayWrapper: {
        height: 'calc(100vh - 64px)',

        overflowY: 'scroll',
      },
      tilesDisplay: {
        display: 'flex',
        flexWrap: 'wrap',
        width: Math.floor(this.props.dimensions.width / 256) * 256,
        margin: 'auto',
        paddingBottom: 16,
      },
    };
  }

  render() {
    if (!this.props.model.apps) {
      return null;
    }

    const tiles = this.props.model.apps
    .map((app, key) => <Tile key={key}
      app={app}
      size="large" />);
    const styles = this.getStyles();

    return <div style={styles.wrapper} >
      <AppBar style={styles.appBar}
        zDepth={this.state.scrolled ? 1 : 0}

        iconElementLeft={arrowBack} />
      <div ref="tilesDisplayWrapper" style={styles.tilesDisplayWrapper} >
        <div style={styles.tilesDisplay} >
          {tiles}
        </div>
      </div>
    </div>;
  }
}

AllApps.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  dimensions: consts.propTypes.DIMENSIONS.isRequired,
};


module.exports = AllApps;
