jest.unmock('@stores/TopSitesStore/TopSitesStore.init');
jest.unmock('@stores/TopSitesStore/TopSitesStore.dataTypes');
jest.unmock('@js/dataTypes');

const init = require('@stores/TopSitesStore/TopSitesStore.init');
const actionCreators = require('@js/actionCreators');
const {
  TopSite: TopSiteRecord,
} = require('@stores/TopSitesStore/TopSitesStore.dataTypes');

describe('`TopSitesStore.init.js` - Function that initializes `TopSitesStore`', () => {
  function mockGet(results) {
    window.chrome = {
      topSites: {
        get: jest.fn(cb => cb(results)),
      },
    };
  }

  function getGet() {
    return window.chrome.topSites.get;
  }

  function getInitAction() {
    return actionCreators.initTopSitesStore;
  }

  function getActionData() {
    return getInitAction().mock.calls[0][0];
  }

  beforeEach(() => {
    mockGet([]);

    actionCreators.initTopSitesStore = jest.fn();
  });

  it('should call the Chrome API to get a list of top visited sites, and pass a function as an argument', () => {
    return init()
    .then(() => {
      expect(getGet()).toBeCalled();
      expect(getGet()).toBeCalledWith(jasmine.any(Function));
    });
  });

  it('should create an action at the end and pass an array as data', () => {
    return init()
    .then(() => {
      expect(getInitAction()).toBeCalled();
      expect(getInitAction()).toBeCalledWith(jasmine.any(Array));
    });
  });

  it('should format end results', () => {
    mockGet([{title: 'test', url: 'testUrl'}]);

    return init()
    .then(() => {
      expect(getActionData()).toEqual([
        new TopSiteRecord({
          id: 't-s-0',
          name: 'test',
          description: 'testUrl',
          url: 'testUrl',
          icon: 'chrome://favicon/testUrl',
        }),
      ]);
    });
  });
});
