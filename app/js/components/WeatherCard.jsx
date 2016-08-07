const React = require('react');
const FlatButton = require('material-ui/FlatButton').default;
const ActionLaunch = require('material-ui/svg-icons/action/launch').default;
const consts = require('@js/constants');
const MyCard = require('@components/MyCard');


function WeatherCard(props) {
  if (!props.model.weather) {
    return null;
  }

  const actions = [
    <FlatButton key={0}
      href="http://openweathermap.org/city"
      label="More weather"
      labelPosition="before"
      icon={<ActionLaunch />} />,
  ];

  return <MyCard size={props.size}
    cardActions={actions} />;
}

WeatherCard.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  size: React.PropTypes.string.isRequired,
};


module.exports = WeatherCard;
