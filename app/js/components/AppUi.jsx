const React = require('react');
const Immutable = require('immutable');
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
const materialColors = require('material-ui/styles/colors');
const consts = require('@js/constants');
const Header = require('@components/Header');
const Dialogs = require('@components/Dialogs');
const Content = require('@components/Content');
const AllApps = require('@components/AllApps');


const getDimensions = (function getDimensionsFactory() {
  const Dimensions = Immutable.Record({
    width: 0,
    height: 0,
  });

  return function getDimensions() {
    return new Dimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
})();

class AppUi extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dimensions: getDimensions(),
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeFunc.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFunc.bind(this));
  }

  resizeFunc() {
    this.setState({
      dimensions: getDimensions(),
    });
  }

  render() {
    return <MuiThemeProvider>
      <div style={styles.wrapper} >
        <Header model={this.props.model} />
        <Dialogs model={this.props.model} />
        <Content model={this.props.model} dimensions={this.state.dimensions} />
        {
          this.props.model.state.navStack.peek() === 'allApps' &&
          <AllApps model={this.props.model} dimensions={this.state.dimensions} />
        }
      </div>
    </MuiThemeProvider>;
  }
}

AppUi.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};

const styles = {
  wrapper: {
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: materialColors.grey200,
  },
};


module.exports = AppUi;
