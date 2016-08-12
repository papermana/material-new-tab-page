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
        label = _('settings_features_name_appscard');
      }
      else if (item === 'topSites') {
        label = _('settings_features_name_topsitescard');
      }
      else if (item === 'bookmarks') {
        label = _('settings_features_name_bookmarkssearch');
      }
      else if (item === 'weather') {
        label = _('settings_features_name_weathercard');
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
    const useGeolocation = config && <Checkbox
      name="useGeolocation"
      label={_('settings_location_geolocation_hint')}
      defaultChecked={config.useGeolocation}
      disabled={!showWeatherSettings}
      onCheck={this.geolocationChange.bind(this)} />;
    const customLocation = config && <TextField name="customLocation"
      hintText={_('settings_location_featurehint')}
      defaultValue={config.customLocation}
      disabled={
        (
          this.state.newConfig.get('useGeolocation') === undefined &&
          config.useGeolocation
        ) ||
        this.state.newConfig.get('useGeolocation') ||
        !showWeatherSettings
      }
      style={{
        width: '100%',
      }}
      onChange={this.customLocationChange.bind(this)} />;
    const tempUnits = config && (() => {
      const defaultUnits = config.tempUnits;

      return <RadioButtonGroup name="tempUnits"
        defaultSelected={defaultUnits}
        onChange={this.tempUnitsChange.bind(this)} >
        <RadioButton value="celsius"
          label={_('settings_tempunits_celsius')}
          disabled={!showWeatherSettings} />
        <RadioButton value="fahrenheit"
          label={_('settings_tempunits_fahrenheit')}
          disabled={!showWeatherSettings} />
      </RadioButtonGroup>;
    })();
    const buttons = [
      <FlatButton label={_('button_cancel')}
        onClick={this.exit.bind(this)} />,
      <FlatButton label={_('button_save')}
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
      title={_('settings_title')}
      actions={buttons}
      autoScrollBodyContent
      onRequestClose={this.exit.bind(this)} >
      <h2>{_('settings_features_header')}</h2>
      <p>{_('settings_features_description')}</p>
      {features}

      <h2>{_('settings_search_header')}</h2>
      {searchEngines}

      <div style={styles.weatherSettings} >
        <h2>{_('settings_location_header')}</h2>
        <p>{_('settings_location_description1')}</p>
        <p>
          {_('settings_location_description2_1')}
          <a href="https://weather.codes/" target="_blank">
            {_('settings_location_description2_2')}
          </a>
          {_('settings_location_description2_3')}
        </p>
        {useGeolocation}
        {customLocation}

        <h2>{_('settings_tempunits_header')}</h2>
        {tempUnits}
      </div>
    </Dialog>;
  }
}

Settings.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};


module.exports = Settings;
