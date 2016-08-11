const React = require('react');
const moment = require('moment');
const FlatButton = require('material-ui/FlatButton').default;
const ActionLaunch = require('material-ui/svg-icons/action/launch').default;
const consts = require('@js/constants');
const MyCard = require('@components/MyCard');


function dayOfTheWeek(day) {
  const days = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];

  return days[day];
}

function colors(icon) {
  const colors = {
    '01': 'rgba(220, 200, 0, 0.55)',
    '02': 'rgba(210, 185, 20, 0.55)',
    '03': 'rgba(60,60,60,0.55)',
    '04': 'rgba(0,0,0,0.55)',
    '09': 'rgba(15, 100, 210, 0.55)',
    '10': 'rgba(0,0,180,0.55)',
    '11': 'rgba(135, 0, 180, 0.55)',
    '13': 'rgba(45,145,130,0.55)',
    '50': 'rgba(0,40,0,0.55)',
  };

  return colors[icon.slice(0, 2)];
}

//  Takes kelvins as input:
function temperature(temp, units) {
  if (units === 'celsius') {
    return (temp - 273.15).toFixed() + '°C';
  }
  else if (units === 'fahrenheit') {
    return (temp * (9 / 5) - 459.67).toFixed() + '°F';
  }
  else {
    throw new Error('Temperature can be rendered either in Celsius or Fahrenheit!');
  }
}

function ForecastItem(props) {
  const icon = props.item.day
    ? props.item.day.icon
    : props.item.night.icon;

  styles.dayOfTheWeek.color = colors(icon);

  return <div style={styles.forecastItem} >
    <h3 style={styles.dayOfTheWeek} >
      {dayOfTheWeek(props.item.date.day())}
    </h3>
    <img src={`assets/weather/${icon}.svg`}
      width="36" height="36"
      style={styles.iconSmall} />
    <div style={styles.timeDay} >
      {props.item.day ? temperature(props.item.day.temp, props.units) : '-'}
    </div>
    <div style={styles.timeNight} >
      {props.item.night ? temperature(props.item.night.temp, props.units) : '-'}
    </div>
  </div>;
}

ForecastItem.propTypes = {
  item: React.PropTypes.shape({
    date: React.PropTypes.instanceOf(moment).isRequired,
    day: React.PropTypes.object,
    night: React.PropTypes.object,
  }).isRequired,
  units: React.PropTypes.oneOf([
    'celsius',
    'fahrenheit',
  ]).isRequired,
};

function WeatherCard(props) {
  if (!props.model.weather) {
    return <MyCard size={props.size} >
      <h2>
        Go to options to set your location in order to get the weather forecast.
      </h2>
    </MyCard>;
  }

  const weather = props.model.weather.toJS();
  const forecast = weather.forecast
  .map((item, key) => {
    return <ForecastItem key={key}
      item={item}
      units={props.model.config.tempUnits} />;
  });
  const actions = [
    <FlatButton key={0}
      href="http://openweathermap.org/city"
      label="More weather"
      labelPosition="before"
      icon={<ActionLaunch />} />,
  ];

  styles.status.color = colors(weather.today.icon);

  return <MyCard size={props.size}
    cardActions={actions}>
    <img src={`assets/weather/${weather.today.icon}.svg`}
      style={styles.icon} />
    <div style={styles.today} >
      <h1 style={styles.city} >
        {weather.location}
      </h1>
      <h2 style={styles.status} >
        {temperature(weather.today.temp, props.model.config.tempUnits)}
        <br />
        {weather.today.status}
      </h2>
    </div>
    <div style={styles.forecast} >
      {forecast}
    </div>
  </MyCard>;
}

WeatherCard.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  size: React.PropTypes.string.isRequired,
};

const styles = {
  icon: {
    float: 'right',
    width: '55%',
    height: 'auto',
    padding: 16,
    pointerEvents: 'none',
  },
  today: {
    position: 'absolute',
    top: 16,
    left: 16,
    maxWidth: 'calc(100% - 32px)',
  },
  city: {
    padding: '8px 8px 0 8px',
    marginBottom: '0.55em',
    fontSize: 24,
    textTransform: 'uppercase',
    textShadow: '1px 1px 1px white, -1px -1px 1px white',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  status: {
    padding: '0 8px',
    marginTop: 0,
    fontSize: 36,
    fontWeight: 'normal',
    lineHeight: '1.6em',
  },
  forecast: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    textAlign: 'center',
  },
  forecastItem: {
    width: '20%',
  },
  dayOfTheWeek: {
    marginBottom: '0.5em',
    fontSize: 18,
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.55)',
  },
  timeDay: {
    marginTop: '0.5em',
    fontSize: 14,
  },
  timeNight: {
    marginTop: '0.5em',
    fontSize: 14,
    color: 'rgba(0,0,140,0.45)',
  },
};


module.exports = WeatherCard;
