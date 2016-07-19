jest.unmock('@stores/StateStore/StateStore.utils');
jest.unmock('@stores/StateStore/StateStore.dataTypes');
jest.unmock('@stores/ConfigStore/ConfigStore.dataTypes');
jest.unmock('@stores/AppsStore/AppsStore.dataTypes');
jest.unmock('@stores/TopSitesStore/TopSitesStore.dataTypes');
jest.unmock('@js/dataTypes');

const Immutable = require('immutable');
const {
  SearchElement,
} = require('@stores/StateStore/StateStore.dataTypes');
const {
  ConfigStoreState,
  SearchEngine,
} = require('@stores/ConfigStore/ConfigStore.dataTypes');
const {
  TopSitesStoreState,
  TopSite,
} = require('@stores/TopSitesStore/TopSitesStore.dataTypes');
const {
  AppsStoreState,
  App,
} = require('@stores/AppsStore/AppsStore.dataTypes');
let utils;
let actionCreators;
let ConfigStore;
let AppsStore;
let TopSitesStore;

describe('`StateStore.utils.js` - A set of utility functions for the `StateStore`', () => {
  describe('`searchFunc()` - Function that performs search', () => {
    function mockConfigStore(returnValue) {
      returnValue = returnValue || {};

      ConfigStore.getState = jest.fn(() => new ConfigStoreState({
        features: returnValue,
        searchEngine: new SearchEngine({
          name: 'Google',
          url: 'https://google.com/search?q=',
        }),
      }));
    }

    function mockTopSitesStore(returnValue) {
      returnValue = returnValue || [];

      TopSitesStore.getState = jest.fn(() => new TopSitesStoreState({
        sites: returnValue,
      }));
    }

    function mockAppsStore(returnValue) {
      returnValue = returnValue || [];

      AppsStore.getState = jest.fn(() => new AppsStoreState({
        apps: returnValue,
      }));
    }

    function runTestWith(searchString) {
      utils.searchFunc(searchString);

      jest.runAllTimers();
    }

    function getResults() {
      return actionCreators.setSearchResults.mock.calls[0][0];
    }

    function getSearchLinkFor(searchString, resultUrl) {
      return new SearchElement({
        id: 'search',
        name: `Search on Google: ${searchString}`,
        description: 'Perform a search on Google with this query',
        url: resultUrl || 'https://google.com/search?q=' + searchString,
        icon: 'assets/ic_search_black_24px.svg',
      });
    }

    const BOOKMARK_SEARCH_DELAY = 450;

    beforeEach(() => {
      utils = require('@stores/StateStore/StateStore.utils');
      actionCreators = require('@js/actionCreators');
      ConfigStore = require('@stores/ConfigStore');
      AppsStore = require('@stores/AppsStore');
      TopSitesStore = require('@stores/TopSitesStore');

      mockConfigStore({
        apps: true,
        topSites: true,
        bookmarks: true,
      });
      mockAppsStore();
      mockTopSitesStore();

      window.chrome = {
        bookmarks: {
          search: jest.fn(),
        },
      };
      window.test = jest.fn();
    });

    it('should create a `setSearchResult` action at the end, passing in the search results; if input was an empty string, `action.data` should be an empty array', () => {
      runTestWith('');

      expect(getResults()).toEqual([]);
    });

    it('should create an array consisting of entries from `AppsStore` and `TopSitesStore` whose `name` properties match the input string; it should also add a search link to the front of the results', () => {
      const app = new App({
        id: 1,
        name: 'test-app',
        description: 'test-app-description',
        url: undefined,
        icon: 'test-app-icon',
      });
      const topSite = new TopSite({
        id: 't-s-1',
        name: 'test-site',
        description: 'test-site',
        url: 'test-site-url',
        icon: 'chrome://favicon/test-site-url',
      });

      mockAppsStore([app]);
      mockTopSitesStore([topSite]);

      runTestWith('test');

      const results = getResults();

      expect(Immutable.is(results[0], getSearchLinkFor('test'))).toBe(true);
      expect(Immutable.is(results[1], app)).toBe(true);
      expect(Immutable.is(results[2], topSite)).toBe(true);
    });

    it('should obviously not include entries that do not match the search string', () => {
      mockAppsStore([
        {id: 1, name: 'test-true'},
        {id: 2, name: 'test-false'},
      ]);

      runTestWith('test-true');

      const results = getResults();

      expect(Immutable.is(results[0], getSearchLinkFor('test-true'))).toBe(true);
      expect(results[1]).toEqual({id: 1, name: 'test-true'});
    });

    it('should not include results from `AppsStore` and `TopSitesStore` if permissions are not granted for them', () => {
      mockConfigStore({
        apps: false,
        topSites: false,
      });
      mockAppsStore([
        {
          id: 1,
          name: 'test-app',
          description: 'test-app-description',
          url: undefined,
          icon: 'test-app-icon',
        },
      ]);
      mockTopSitesStore([
        {
          id: 't-s-1',
          name: 'test-site',
          description: 'test-site',
          url: 'test-site-url',
          icon: 'chrome://favicon/test-site-url',
        },
      ]);

      runTestWith('test');

      const results = getResults();

      expect(results.length).toBe(1);
      expect(Immutable.is(results[0], getSearchLinkFor('test'))).toBe(true);
    });

    it('should only show three results from each category (apps, top sites, bookmarks [tested later])', () => {
      mockAppsStore([
        {id: 1, name: 'test'},
        {id: 2, name: 'test-2'},
        {id: 3, name: 'test-3'},
        {id: 4, name: 'test-4'},
      ]);
      mockTopSitesStore([
        {id: 't-s-1', name: 'test'},
        {id: 't-s-2', name: 'test-2'},
        {id: 't-s-3', name: 'test-3'},
        {id: 't-s-4', name: 'test-4'},
      ]);

      runTestWith('test');

      const results = getResults();

      expect(results.length).toBe(7);
      expect(Immutable.is(results[0], getSearchLinkFor('test'))).toBe(true);
      expect(results.slice(1)).toEqual([
        {id: 1, name: 'test'},
        {id: 2, name: 'test-2'},
        {id: 3, name: 'test-3'},
        {id: 't-s-1', name: 'test'},
        {id: 't-s-2', name: 'test-2'},
        {id: 't-s-3', name: 'test-3'},
      ]);
    });

    it('should split the search string on spaces, perform search for each of them, and show the results that fit the most sub-strings (as well as order them from the most accurate to the least)', () => {
      mockAppsStore([
        {id: 1, name: 'one'},
        {id: 2, name: 'one two'},
        {id: 3, name: 'one two three'},
        {id: 4, name: 'one two three four'},
      ]);

      runTestWith('four three two one');

      const results = getResults();

      expect(results.slice(1)).toEqual([
        {id: 4, name: 'one two three four'},
        {id: 3, name: 'one two three'},
        {id: 2, name: 'one two'},
      ]);
    });

    it('should perform a search on bookmarks using the query string ' + BOOKMARK_SEARCH_DELAY + ' milliseconds after the initial "apps+topSites" search, and create a `setSearchResults` action again if something is found', () => {
      window.chrome.bookmarks.search = jest.fn((input, cb) => cb([
        {id: 1, title: 'test', url: 'test-url'},
      ]));
      mockAppsStore([
        {id: 1, name: 'test'},
      ]);

      runTestWith('test');

      const firstCallResults = getResults();

      expect(firstCallResults.length).toBe(2);
      expect(firstCallResults[1]).toEqual({id: 1, name: 'test'});

      actionCreators.setSearchResults = jest.fn();

      return window.test.mock.calls[0][0]
      .then(() => {
        expect(setTimeout.mock.calls[1][1]).toBe(BOOKMARK_SEARCH_DELAY);
        expect(window.chrome.bookmarks.search).toBeCalledWith('test', jasmine.any(Function));

        const secondCallResults = getResults();

        expect(secondCallResults.length).toBe(3);
        expect(secondCallResults[1]).toEqual({id: 1, name: 'test'});
        expect(secondCallResults[2].toJS()).toEqual({
          id: 'b-1',
          name: 'test',
          description: 'test',
          url: 'test-url',
          icon: 'chrome://favicon/test-url',
        });
      });
    });

    it('should not search in bookmarks if permission wasn\'t granted for it', () => {
      window.chrome.bookmarks.search = jest.fn((input, cb) => cb([
        {id: 1, title: 'test', url: 'test-url'},
      ]));
      mockConfigStore({
        apps: true,
        topSites: true,
        bookmarks: false,
      });
      mockAppsStore([
        {id: 1, name: 'test'},
      ]);

      runTestWith('test');

      expect(window.test).not.toBeCalled();
    });

    it('should not create the second action if bookmarks search returns nothing', () => {
      window.chrome.bookmarks.search = jest.fn((input, cb) => cb([]));
      mockAppsStore([
        {id: 1, name: 'test'},
      ]);

      runTestWith('test');

      expect(getResults()[1]).toEqual({id: 1, name: 'test'});

      return window.test.mock.calls[0][0]
      .then(() => {
        expect(getResults().length).toBe(2);
      });
    });

    it('should skip any bookmarks that don\'t have a url (meaning they\'re actually a folder) or whose url already exists in the results (from one of the top sites or hosted apps)', () => {
      window.chrome.bookmarks.search = jest.fn((input, cb) => cb([
        {id: 1, title: 'test', url: undefined},
        {id: 2, title: 'test', url: 'test-url'},
        {id: 3, title: 'test', url: 'different-url'},
      ]));
      mockAppsStore([
        {id: 1, name: 'test', url: 'test-url'},
      ]);

      runTestWith('test');

      return window.test.mock.calls[0][0]
      .then(() => {
        const results = getResults();

        expect(results.length).toBe(3);
        expect(results[1]).toEqual({id: 1, name: 'test', url: 'test-url'});
        expect(results[2].toJS()).toEqual({
          id: 'b-3',
          name: 'test',
          description: 'test',
          url: 'different-url',
          icon: 'chrome://favicon/different-url',
        });
      });
    });


    it('should search bookmarks even if nothing get\'s returned from apps or topSites', () => {
      window.chrome.bookmarks.search = jest.fn((input, cb) => cb([
        {id: 1, title: 'test', url: 'test-url'},
      ]));

      runTestWith('test');

      return window.test.mock.calls[0][0]
      .then(() => {
        const results = getResults();

        expect(results.length).toBe(2);
        expect(results[1].toJS()).toEqual({
          id: 'b-1',
          name: 'test',
          description: 'test',
          url: 'test-url',
          icon: 'chrome://favicon/test-url',
        });
      });
    });
  });
});
