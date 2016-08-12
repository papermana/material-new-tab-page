const React = require('react');
const Immutable = require('immutable');
const Checkbox = require('material-ui/Checkbox').default;
const Dialog = require('material-ui/Dialog').default;
const FlatButton = require('material-ui/FlatButton').default;
const RadioButton = require('material-ui/RadioButton').default;
const RadioButtonGroup = require('material-ui/RadioButton/RadioButtonGroup').default;
const TextField = require('material-ui/TextField').default;
const actionCreators = require('@js/actionCreators');
const consts = require('@js/constants');


class Settings extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      gotChanged: false,
      newConfig: Immutable.Map(),
    };
  }

  featuresChange(e) {
    let newConfig = this.state.newConfig;

    if (e.target.name === 'weather' && !e.target.checked) {
      newConfig = newConfig
      .remove('useGeolocation')
      .remove('customLocation')
      .remove('tempUnits');
    }

    this.setState({
      gotChanged: true,
      newConfig: newConfig.setIn(['features', e.target.name], e.target.checked),
    });
  }

  searchEngineChange(e) {
    this.setState({
      gotChanged: true,
      newConfig: this.state.newConfig.set('searchEngine', e.target.value),
    });
  }

  geolocationChange(e) {
    this.setState({
      gotChanged: true,
      newConfig: this.state.newConfig.set('useGeolocation', e.target.checked),
    });
  }

  customLocationChange(e) {
    this.setState({
      gotChanged: true,
      newConfig: this.state.newConfig.set('customLocation', e.target.value),
    });
  }

  tempUnitsChange(e) {
    this.setState({
      gotChanged: true,
      newConfig: this.state.newConfig.set('tempUnits', e.target.value),
    });
  }

  exit() {
    this.setState({
      gotChanged: false,
      newConfig: Immutable.Map(),
    });
    actionCreators.goBack();
  }

  save() {
    actionCreators.setConfig(this.state.newConfig.toJS());
    this.exit();
  }

  render() {
    const config = this.props.model.config;
    const features = config && config.features
    .keySeq()
    .map((item, i) => {
      let label;

      if (item === 'apps') {
        label = 'Apps Card';
      }
      else if (item === 'topSites') {
        label = 'Top Sites Card';
      }
      else if (item === 'bookmarks') {
        label = 'Bookmarks Search';
      }
      else if (item === 'weather') {
        label = 'Weather Card';
      }

      return <Checkbox key={i}
        label={label}
        name={item}
        defaultChecked={config.features.get(item)}
        onCheck={this.featuresChange.bind(this)} />;
    });
    const searchEngines = config && (() => {
      const defaultEngine = config.searchEngine.name;
      const engines = consts.searchEngines
      .map((value, i) => {
        return <RadioButton key={i} value={value.name} label={value.name} />;
      });

      return <RadioButtonGroup name="searchEngines"
        defaultSelected={defaultEngine}
        onChange={this.searchEngineChange.bind(this)} >
        {engines}
      </RadioButtonGroup>;
    })();
    const showWeatherSettings = (
      this.state.newConfig.getIn(['features', 'weather']) === true ||
      (
        config.features.weather &&
        this.state.newConfig.getIn(['features', 'weather']) !== false
      )
    );
    const useGeolocation = config && <Checkbox label="Use geolocation to automatically detect where you are."
      name="useGeolocation"
      defaultChecked={config.useGeolocation}
      disabled={!showWeatherSettings}
      onCheck={this.geolocationChange.bind(this)} />;
    const customLocation = config && <TextField name="customLocation"
      hintText="Enter city name of ID"
      disabled={
        (
          this.state.newConfig.get('useGeolocation') === undefined &&
          config.useGeolocation
        ) ||
        this.state.newConfig.get('useGeolocation') ||
        !showWeatherSettings
      }
      onChange={this.customLocationChange.bind(this)} />;
    const tempUnits = config && (() => {
      const defaultUnits = config.tempUnits;

      return <RadioButtonGroup name="tempUnits"
        defaultSelected={defaultUnits}
        onChange={this.tempUnitsChange.bind(this)} >
        <RadioButton value="celsius"
          label="Celsius"
          disabled={!showWeatherSettings} />
        <RadioButton value="fahrenheit"
          label="Fahrenheit"
          disabled={!showWeatherSettings} />
      </RadioButtonGroup>;
    })();
    const buttons = [
      <FlatButton label="Cancel"
        onClick={this.exit.bind(this)} />,
      <FlatButton label="Save"
        primary
        disabled={!this.state.gotChanged}
        onClick={this.save.bind(this)} />,
    ];

    const styles = {
      weatherSettings: {
        opacity: showWeatherSettings ? 1 : 0.5,
        pointerEvents: showWeatherSettings ? 'auto' : 'none',
        WebkitUserSelect: showWeatherSettings ? 'auto' : 'none',
      },
    };

    return <Dialog open={true}
      title="Settings"
      actions={buttons}
      autoScrollBodyContent
      onRequestClose={this.exit.bind(this)} >
      <h2>Enable features:</h2>
      <p>Some of the features may request additional permissions.</p>
      {features}

      <h2>Search engine:</h2>
      {searchEngines}

      <div style={styles.weatherSettings} >
        <h2>Location:</h2>
        <p>Used for getting the weather forecast.</p>
        <p>It is best to use a city <a href="https://weather.codes/" target="_blank">unique ID</a>.</p>
        {useGeolocation}
        {customLocation}

        <h2>Temperature units:</h2>
        {tempUnits}
      </div>
    </Dialog>;
  }
}

Settings.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};


module.exports = Settings;
