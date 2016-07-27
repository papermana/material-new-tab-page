const React = require('react');
const reactCss = require('reactcss').default;
const {
  MuiThemeProvider,
} = require('material-ui');
const materialColors = require('material-ui/styles/colors');
const consts = require('@js/constants');
const Header = require('@components/Header');
const Dialogs = require('@components/Dialogs');
const Content = require('@components/Content');


class AppUi extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dimensions: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
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
      dimensions: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }

  render() {
    return <MuiThemeProvider>
      <div style={styles.wrapper} >
        <Header />
        <Dialogs model={this.props.model} />
        <Content model={this.props.model} dimensions={this.state.dimensions} />
      </div>
    </MuiThemeProvider>;
  }
}

AppUi.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: materialColors.grey200,
  },
};


module.exports = AppUi;
