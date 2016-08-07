const React = require('react');
const moment = require('moment');
const FlatButton = require('material-ui/FlatButton').default;
const ActionLaunch = require('material-ui/svg-icons/action/launch').default;
const consts = require('@js/constants');
const MyCard = require('@components/MyCard');


//  The forecast is a list of objects containing weather data, all set 3 hours apart.
//  We only want one reading for the day and one for the night, so we'll pick
//  those that have hours closest to desired. The first item in the forecast is
//  from as recently as possible (e.g. if it's fetched on 16:25, list[0] is going
//  to be for 16:00), and subsequent forecasts are set exactly 3 hours from each other.
//  Therefore, we're not guaranteed to have a forecast for 12:00, for example. We can
//  only approximate.
function isDay(hour) {
  return hour === 11 || hour === 12 || hour === 13;
}

function isNight(hour) {
  return hour === 23 || hour === 0 || hour === 1;
}

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

function ForecastItem(props) {
  const icon = props.item.day
    ? props.item.day.weather[0].icon
    : props.item.night.weather[0].icon;

  styles.dayOfTheWeek.color = colors(icon);

  return <div style={styles.forecastItem} >
    <h3 style={styles.dayOfTheWeek} >
      {dayOfTheWeek(props.item.date.day())}
    </h3>
    <img src={`assets/weather/${icon}.svg`}
      width="32" height="32"
      style={styles.iconSmall} />
    <div style={styles.timeDay} >
      {props.item.day ? props.item.day.main.temp : '-'}
    </div>
    <div style={styles.timeNight} >
      {props.item.night ? props.item.night.main.temp : '-'}
    </div>
  </div>;
}

ForecastItem.propTypes = {
  item: React.PropTypes.shape({
    date: React.PropTypes.instanceOf(moment).isRequired,
    day: React.PropTypes.object,
    night: React.PropTypes.object,
  }).isRequired,
};

function WeatherCard(props) {
  if (!props.model.weather) {
    return null;
  }

  const today = props.model.weather.today.toJS();
  const weather = {
    name: today.name,
    today: {},
    forecast: [],
  };

  weather.today = {
    temp: today.main.temp,
    status: today.weather[0].main,
    icon: today.weather[0].icon,
  };

  const now = moment().startOf('day');
  let currentDay = 0;

  props.model.weather.getIn(['forecast', 'list'])
  .toJS()
  .map(item => ({
    date: moment.utc(item.dt_txt),
    weather: item,
  }))
  .filter(item => isDay(item.date.hour()) || isNight(item.date.hour()))
  .forEach(item => {
    if (isDay(item.date.hour()) && item.date.date() !== now.date()) {
      currentDay++;
    }

    if (!weather.forecast[currentDay]) {
      weather.forecast[currentDay] = {
        date: now.clone().add(currentDay, 'd'),
      };
    }

    const time = isDay(item.date.hour()) ? 'day' : 'night';

    weather.forecast[currentDay][time] = item.weather;
  });

  const forecast = weather.forecast
  .map((item, key) => {
    return <ForecastItem key={key}
      item={item} />;
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
    <h1 style={styles.city} >
      {weather.name}
    </h1>
    <h2 style={styles.status} >
      {weather.today.temp}
      <br />
      {weather.today.status}
    </h2>

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
  city: {
    padding: '8px 8px 0 8px',
    marginBottom: '0.55em',
    fontSize: '1.2em',
    textTransform: 'uppercase',
  },
  status: {
    padding: '0 8px',
    marginTop: 0,
    fontSize: '2.1em',
    fontWeight: 'normal',
    lineHeight: '1.6em',
  },
  icon: {
    float: 'right',
    width: '40%',
    height: 'auto',
    padding: 16,
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
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.55)',
  },
  timeDay: {
    marginTop: '0.5em',
  },
  timeNight: {
    marginTop: '0.5em',
    color: 'rgba(0,0,140,0.45)',
  },
};


module.exports = WeatherCard;
