const React = require('react');
const {
  AutoComplete,
  IconButton,
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
  }

  clearInputFunc() {
    this.setState({
      input: '',
    });
  }

  render() {
    const source = ['foo', 'bar'];

    return <Paper style={styles.wrapper} >
      <ActionSearch style={styles.searchIcon} />
      <AutoComplete style={styles.searchField}
        inputStyle={styles.searchInput}
        dataSource={source}
        searchText={this.state.input}
        openOnFocus
        fullWidth
        underlineShow={false}
        onUpdateInput={this.inputFunc.bind(this)} />
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

const styles = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    width: (6 / 12 * 100) + 'vw',
    minWidth: 385,
    margin: 'auto',
    padding: '4px 0',
  },
  searchField: {
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
};


module.exports = SearchBar;
