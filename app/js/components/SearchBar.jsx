const React = require('react');
const {
  AutoComplete,
  IconButton,
  MenuItem,
  Paper,
} = require('material-ui');
const {
  ActionSearch,
  NavigationClose,
} = require('material-ui/svg-icons');
const actionCreators = require('@js/actionCreators');
const consts = require('@js/constants');


class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: '',
    };
  }

  inputFunc(text) {
    this.setState({
      input: text,
    });

    actionCreators.setSearchValue(text);
  }

  clearInputFunc() {
    this.setState({
      input: '',
    });
  }

  clickFunc(i) {
    //  if enter gets pressed (i === -1), then open search result:
    i = i < 0 ? 0 : i;

    const app = this.props.model.state.searchResults.get(i);

    if (app.has('url') && app.url !== '') {
      window.location = app.url;
    }
    else {
      chrome.management.launchApp(app.id);
    }
  }

  render() {
    const source = this.props.model.state.searchResults
    .toArray()
    .map(item => ({
      text: item.name,
      value: (
        <MenuItem primaryText={item.name}
          innerDivStyle={styles.result}
          children={<img src={item.icon} style={styles.resultIcon} />} />
      ),
    }));

    return <Paper style={styles.wrapper} >
      <ActionSearch style={styles.searchIcon} />
      <AutoComplete
        inputStyle={styles.searchInput}
        dataSource={source}
        searchText={this.state.input}
        openOnFocus
        fullWidth
        underlineShow={false}
        onUpdateInput={this.inputFunc.bind(this)}
        onNewRequest={(req, i) => this.clickFunc(i)} />
      {
        this.state.input !== '' &&
        <IconButton style={styles.closeIcon}
          onClick={this.clearInputFunc.bind(this)} >
          <NavigationClose />
        </IconButton>
      }
    </Paper>;
  }
}

SearchBar.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
};

const styles = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    width: (6 / 12 * 100) + 'vw',
    minWidth: 385,
    margin: 'auto',
    padding: '4px 0',
  },
  searchInput: {
    fontSize: 18,
    width: 'calc(100% - 48px - 48px)',
    paddingLeft: 48,
    paddingRight: 48,
  },
  searchIcon: {
    position: 'absolute',
    top: 12 + 4,
    left: 12,
  },
  closeIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  result: {
    display: 'flex',
    //  Subtract width of the icon:
    width: 'calc(100% - 48px)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  resultIcon: {
    width: 16,
    height: 16,
    padding: 16,
    paddingLeft: 0,
  },
};


module.exports = SearchBar;
