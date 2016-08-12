const actionCreators = require('@js/actionCreators');
const {
  SearchElement,
} = require('@stores/StateStore/StateStore.dataTypes');
const ConfigStore = require('@stores/ConfigStore');
const AppsStore = require('@stores/AppsStore');
const TopSitesStore = require('@stores/TopSitesStore');
const _ = chrome.i18n.getMessage;


function searchUrl(url, input) {
  return url + encodeURIComponent(input);
}

const searchFunc = (function searchFuncFactory() {
  let bookmarkSearchTimeout;

  return function searchFunc(input) {
    const results = [];
    const permissions = ConfigStore.getState().features;

    if (input !== '') {
      const engine = ConfigStore.getState().searchEngine;
      const queries = input.split(' ').map(string => new RegExp(string, 'i'));
      const lists = [];

      if (permissions.apps) {
        lists.push(AppsStore.getState().apps);
      }

      if (permissions.topSites) {
        lists.push(TopSitesStore.getState().sites);
      }

      results.push(new SearchElement({
        id: 'search',
        name: _('statestore_search_text', [engine.name, input]),
        description: _('statestore_search_description', engine.name),
        url: searchUrl(engine.url, input),
        icon: 'assets/ic_search_black_24px.svg',
      }));

      lists.forEach(list => {
        const allMatches = [];
        const occurences = {};

        queries.forEach(query => {
          allMatches.push(...list
          .filter(item => query.test(item.name)));
        });

        allMatches.forEach(item => {
          const find = occurences[item.id];

          if (find === undefined) {
            occurences[item.id] = 1;
          }
          else {
            occurences[item.id] += 1;
          }
        });

        //  Putting an `id` as a key of an object will convert it into a string, so let's also explicitly convert id's when comparing them with keys from `occurences`.
        results.push(...Object.keys(occurences)
        .sort((a, b) => occurences[b] - occurences[a])
        .slice(0, 3)
        .map(occurence => allMatches.find(match => String(match.id) === occurence)));
      });
    }

    //  Use a timeout so we don't dispatch during a dispatch.
    setTimeout(dispatch, 0);

    //  Use a timeout so we don't perform an expensive bookmark searching
    //  operation needlessly.
    if (bookmarkSearchTimeout) {
      clearTimeout(bookmarkSearchTimeout);
    }

    bookmarkSearchTimeout = setTimeout(searchBookmarks, 450);

    function searchBookmarks() {
      if (permissions.bookmarks !== true) {
        return;
      }

      if (results.length === 0) {
        return;
      }

      //  Assign for testing:
      const test = new Promise((resolve, reject) => {
        chrome.bookmarks.search(input, bookmarks => resolve(bookmarks));
      })
      .then(bookmarks => {
        if (bookmarks.length === 0) {
          return;
        }

        results.push(...bookmarks
        .filter(bookmark => {
          if (!bookmark.url) {
            return false;
          }

          if (results.find(item => item.url === bookmark.url)) {
            return false;
          }

          return true;
        })
        .map(bookmark => new SearchElement({
          id: 'b-' + bookmark.id,
          name: bookmark.title,
          description: bookmark.url,
          url: bookmark.url,
          icon: 'chrome://favicon/' + bookmark.url,
        }))
        .slice(0, 3));

        dispatch();
      });

      window.test && window.test(test);
    }

    function dispatch() {
      actionCreators.setSearchResults(results);
    }
  };
})();


module.exports = {
  searchFunc,
};
