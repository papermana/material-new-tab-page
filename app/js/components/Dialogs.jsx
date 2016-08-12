const React = require('react');
const consts = require('@js/constants');
const Settings = require('@components/Settings');
const About = require('@components/About');


function Dialogs(props) {
  const dialogs = {
    settings: <Settings model={props.model} />,
    about: <About />,
  };
  const currentDialog = dialogs[props.model.state.navStack.peek()];

  return <div>
    {currentDialog}
  </div>;
}

Dialogs.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};


module.exports = Dialogs;
