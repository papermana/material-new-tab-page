const React = require('react');
const {
  AutoComplete,
  Paper,
} = require('material-ui');
const {
  ActionSearch,
} = require('material-ui/svg-icons');
const actionCreators = require('@js/actionCreators');
const consts = require('@js/constants');


function SearchBar(props) {
  const source = ['foo', 'bar'];

  return <Paper style={styles.wrapper} >
    <ActionSearch style={styles.searchIcon} />
    <AutoComplete style={styles.searchField}
      inputStyle={styles.searchInput}
      dataSource={source}
      openOnFocus
      fullWidth
      underlineShow={false} />
  </Paper>;
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
    width: 'calc(100% - 8px - 48px)',
    paddingLeft: 48,
    paddingRight: 8,
  },
  searchIcon: {
    position: 'absolute',
    top: 12 + 4,
    left: 12,
  },
};


module.exports = SearchBar;
