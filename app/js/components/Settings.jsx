const React = require('react');
const Immutable = require('immutable');
const Checkbox = require('material-ui/Checkbox').default;
const Dialog = require('material-ui/Dialog').default;
const FlatButton = require('material-ui/FlatButton').default;
const RadioButton = require('material-ui/RadioButton').default;
const RadioButtonGroup = require('material-ui/RadioButton/RadioButtonGroup').default;
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
    this.setState({
      gotChanged: true,
      newConfig: this.state.newConfig.setIn(['features', e.target.name], e.target.checked),
    });
  }

  searchEngineChange(e) {
    this.setState({
      gotChanged: true,
      newConfig: this.state.newConfig.set('searchEngine', e.target.value),
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
    const tempUnits = config && (() => {
      const defaultUnits = config.tempUnits;

      return <RadioButtonGroup name="tempUnits"
        defaultSelected={defaultUnits}
        onChange={this.tempUnitsChange.bind(this)} >
        <RadioButton value="celsius" label="Celsius" />
        <RadioButton value="fahrenheit" label="Fahrenheit" />
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

      <h2>Temperature units:</h2>
      {tempUnits}
    </Dialog>;
  }
}

Settings.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};


module.exports = Settings;
