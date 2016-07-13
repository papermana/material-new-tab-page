const React = require('react');
const reactCss = require('reactcss').default;
const consts = require('@js/constants');


function AppUi(props) {
  return <div style={styles.wrapper} >
    <p style={styles.text} >
      Hello World
    </p>
  </div>;
}

AppUi.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};

const styles = reactCss({
  default: {
    wrapper: {
      backgroundColor: 'grey',
    },
    text: {
      backgroundColor: 'white',
    },
  },
});


module.exports = AppUi;
