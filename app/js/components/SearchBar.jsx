const React = require('react');
const AutoComplete = require('material-ui/AutoComplete').default;
const IconButton = require('material-ui/IconButton').default;
const MenuItem = require('material-ui/MenuItem').default;
const Paper = require('material-ui/Paper').default;
const ActionSearch = require('material-ui/svg-icons/action/search').default;
const NavigationClose = require('material-ui/svg-icons/navigation/close').default;
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

    setTimeout(() => {
      if (text === this.state.input) {
        actionCreators.setSearchValue(text);
      }
    }, 400);
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
      //  Workaround for the fact that you can't normally open pages using
      //  the `chrome://` protocol from a non-chrome-internal page.
      //  We use `chrome.tabs.create` to create a new tab (doesn't actually
      //  require any permissions); otherwise we simply open the new page
      //  in the same tab as normal:
      if (app.url.includes('chrome://')) {
        chrome.tabs.getCurrent(tab => {
          chrome.tabs.create({url: app.url}, () => {
            chrome.tabs.remove(tab.id);
          });
        });
      }
      else {
        window.location = app.url;
      }
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
          title={item.description}
          children={<img src={item.icon} style={styles.resultIcon} />} />
      ),
    }));

    return <div style={this.props.style} >
      <Paper style={styles.paper} >
        <ActionSearch style={styles.searchIcon} />
        <AutoComplete
          inputStyle={styles.searchInput}
          hintStyle={styles.searchHint}
          dataSource={source}
          searchText={this.state.input}
          hintText="Type in to search"
          openOnFocus
          fullWidth
          underlineShow={false}
          filter={() => true}
          onUpdateInput={this.inputFunc.bind(this)}
          onNewRequest={(req, i) => this.clickFunc(i)} />
        {
          this.state.input !== '' &&
          <IconButton style={styles.closeIcon}
            onClick={this.clearInputFunc.bind(this)} >
            <NavigationClose />
          </IconButton>
        }
      </Paper>
    </div>;
  }
}

SearchBar.propTypes = {
  model: consts.propTypes.MODEL.isRequired,
  style: consts.propTypes.STYLE,
};

const styles = {
  paper: {
    position: 'relative',
    display: 'flex',
    width: (6 / 12 * 100) + 'vw',
    //  There is also max-width set on the wrapper of this element, in Header.jsx:
    maxWidth: '100%',
    margin: 'auto',
    padding: '2px 0',
  },
  searchInput: {
    fontSize: 18,
    width: 'calc(100% - 48px - 48px)',
    paddingLeft: 48,
    paddingRight: 48,
  },
  searchHint: {
    paddingLeft: 48,
  },
  searchIcon: {
    position: 'absolute',
    top: 12 + 2,
    left: 12,
  },
  closeIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
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
