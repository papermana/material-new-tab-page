const React = require('react');
const consts = require('@js/constants');
const AppBar = require('material-ui/AppBar').default;
const IconButton = require('material-ui/IconButton').default;
const {
  NavigationArrowBack,
} = require('material-ui/svg-icons');
const actionCreators = require('@js/actionCreators');
const Tile = require('@components/Tile');


class AllApps extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scrolled: false,
      animStage: 0,
    };

    this._scrollFuncBuffer;
    this._rippleRadius = 0;
    this._rippleScaleAnimDuration = 400;
    this._rippleOpacityAnimDuration = 200;
  }

  componentWillMount() {
    //  Get the radius of the ripple that fills the entire screen, and has its
    //  central point on the bottom edge of the screen, in the middle.
    const a = this.props.dimensions.width / 2;
    const b = this.props.dimensions.height;

    this._rippleRadius = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  }

  componentDidMount() {
    document.body.style.overflowY = 'hidden';

    this.refs.tilesDisplayWrapper.addEventListener('scroll', this.scrollFunc.bind(this));

    this._startOpeningAnimation();
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

  _startOpeningAnimation() {
    //  Note about animation here:
    //  We're animating a ripple effect. A white ripple appears on the screen and
    //  starts growing, taking over the entire viewport. Then all the elements
    //  of this element appear in an opacity animation.
    //  The animation process is divided into stages:
    //  0 -- just initialized; ripple is at `scale` 0, `opacity` 1; everything else is at opacity 0; go to stage 1 as soon as possible,
    //  1 -- set `scale` on the ripple to 1, after animation is finished go to stage 2,
    //  2 -- set `display` on non-ripple elements to `none`; go to stage 3 immediately,
    //  3 -- set `opacity` on the ripple to 0, after animation is finished go to stage 4,
    //  4 -- all animation finished, set `display` to `none` on the ripple.
    //  In some cases we use a shorter delay than actual animation; this is to make
    //  things feel snappier.
    //  We're also using `opacity` and `pointer-events` combo instead of manipulating
    //  `display`, for the same effect, but more stable.

    const setAnimStage4 = this._setAnimStageFactory(4, () => {}, 0);
    const setAnimStage3 = this._setAnimStageFactory(3, setAnimStage4, this._rippleOpacityAnimDuration);
    const setAnimStage2 = this._setAnimStageFactory(2, setAnimStage3, 0);
    const setAnimStage1 = this._setAnimStageFactory(1, setAnimStage2, this._rippleScaleAnimDuration / 1.8);

    setTimeout(setAnimStage1.bind(this), 0);
  }

  _startClosingAnimation() {
    //  Basically just reversed version of `_startClosingAnimation()`.
    //  Stages:
    //  4 -- as set in `_startClosingAnimation()`,
    //  5 -- set `display` to `block` on the ripple, go to stage 6 immediately,
    //  6 -- set `opacity` on the ripple to 1; after the animation go to stage 7,
    //  7 -- set `display` on other elements to whatever it was originally; go to stage 8 ASAP,
    //  8 -- set 'scale' on the ripple to 0; go to stage 9 after the animation,
    //  9 -- unmount the element.

    const setAnimStage9 = () => {
      this._exit();
    };
    const setAnimStage8 = this._setAnimStageFactory(8, setAnimStage9, this._rippleScaleAnimDuration);
    const setAnimStage7 = this._setAnimStageFactory(7, setAnimStage8, 0);
    const setAnimStage6 = this._setAnimStageFactory(6, setAnimStage7, this._rippleOpacityAnimDuration / 2);
    const setAnimStage5 = this._setAnimStageFactory(5, setAnimStage6, 0);

    setTimeout(setAnimStage5.bind(this), 0);
  }

  _setAnimStageFactory(stage, nextFunction, delay) {
    return () => {
      this.setState({
        animStage: stage,
      });

      setTimeout(nextFunction.bind(this), delay);
    };
  }

  _exit() {
    actionCreators.goBack();
  }

  getStyles() {
    const aStage = this.state.animStage;

    return {
      wrapper: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 200,
      },
      appBar: {
        backgroundColor: 'white',
        opacity: aStage >= 2 && aStage < 7 ? 1 : 0,
        pointerEvents: aStage >= 2 && aStage < 7 ? 'auto' : 'none',
        zIndex: 10,
        transition: 'none',
      },
      tilesDisplayWrapper: {
        height: 'calc(100vh - 64px)',
        backgroundColor: 'white',
        opacity: aStage >= 2 && aStage < 7 ? 1 : 0,
        pointerEvents: aStage >= 2 && aStage < 7 ? 'auto' : 'none',
        overflowY: 'scroll',
      },
      tilesDisplay: {
        display: 'flex',
        flexWrap: 'wrap',
        width: Math.floor(this.props.dimensions.width / 256) * 256,
        margin: 'auto',
        paddingBottom: 16,
      },
      ripple: {
        position: 'fixed',
        bottom: -this._rippleRadius,
        left: (this.props.dimensions.width / 2) - this._rippleRadius,
        display: aStage === 4 ? 'none' : 'block',
        width: this._rippleRadius * 2,
        height: this._rippleRadius * 2,
        borderRadius: '100%',
        backgroundColor: 'white',
        opacity: aStage >= 3 && aStage < 6 ? 0 : 1,
        transform: `scale(${aStage >= 1 && aStage < 8 ? 1 : 0})`,
        transition: `transform ${this._rippleScaleAnimDuration / 1000}s, opacity ${this._rippleOpacityAnimDuration / 1000}s`,
        zIndex: 20,
      },
    };
  }

  render() {
    if (!this.props.model.apps) {
      return null;
    }

    const arrowBack = <IconButton
      onClick={this._startClosingAnimation.bind(this)} >
      <NavigationArrowBack color="black" />
    </IconButton>;
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
      <div style={styles.ripple} />
    </div>;
  }
}

AllApps.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  dimensions: consts.propTypes.DIMENSIONS.isRequired,
};


module.exports = AllApps;
