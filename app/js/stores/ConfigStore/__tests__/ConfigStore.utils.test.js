jest.unmock('@stores/ConfigStore/ConfigStore.utils');
jest.unmock('@stores/ConfigStore/ConfigStore.dataTypes');
jest.unmock('@js/constants');

const utils = require('@stores/ConfigStore/ConfigStore.utils');
const storageHelpers = require('@utils/chromeStorageHelpers');
const actionCreators = require('@js/actionCreators');
const {
  ConfigStoreState,
  Features: FeaturesRecord,
  SearchEngine: SearchEngineRecord,
} = require('@stores/ConfigStore/ConfigStore.dataTypes');

describe('`ConfigStore.utils` - Utility functions for `ConfigStore`', () => {
  describe('`init()` - Function that initializes `ConfigStore`', () => {
    function getInitAction() {
      return actionCreators.initConfigStore;
    }

    function getActionData() {
      return getInitAction().mock.calls[0][0];
    }

    beforeEach(() => {
      storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(undefined));

      actionCreators.initConfigStore = jest.fn();
    });

    it('should call `storageHelpers.getFromStorage`', () => {
      return utils.init()
      .then(() => {
        expect(storageHelpers.getFromStorage).toBeCalled();
      });
    });

    it('should create the `initConfigStore` action at the end', () => {
      return utils.init()
      .then(() => {
        expect(getInitAction()).toBeCalled();
      });
    });

    it('should pass default config to the action when there\'s nothing under the key `config` in storage', () => {
      return utils.init()
      .then(() => {
        expect(getActionData()).toEqual({
          features: new FeaturesRecord(),
          searchEngine: new SearchEngineRecord({
            name: 'Google',
            url: 'https://google.com/search?q=',
          }),
        });
      });
    });

    it('should pass config from storage to the action if there is data under the key `config` in storage', () => {
      storageHelpers.getFromStorage = jest.fn(() => Promise.resolve({
        features: {
          apps: true,
          bookmarks: true,
          topSites: false,
        },
        searchEngine: 'DuckDuckGo',
      }));

      return utils.init()
      .then(() => {
        expect(getActionData()).toEqual({
          features: new FeaturesRecord({
            apps: true,
            bookmarks: true,
            topSites: false,
          }),
          searchEngine: new SearchEngineRecord({
            name: 'DuckDuckGo',
            url: 'https://duckduckgo.com/?q=',
          }),
        });
      });
    });
  });

  describe('`changePermissions()` - Internal function which helps manage turning features on and off by the user', () => {
    beforeEach(() => {
      actionCreators.permissionsGranted = jest.fn();
      actionCreators.permissionsRevoked = jest.fn();
      actionCreators.setConfig = jest.fn();

      window.chrome = {
        permissions: {
          request: jest.fn(),
          remove: jest.fn(),
        },
      };
    });

    it('should call `chrome.permissions.request` for each feature that got turned on and `chrome.permissions.remove` for each feature that got turned off', () => {
      const oldPermissions = {
        apps: true,
        topSites: false,
      };
      const newPermissions = {
        apps: false,
        topSites: true,
      };

      utils.__tests__.changePermissions(newPermissions, oldPermissions)
      .then(() => {
        jest.runAllTimers();

        expect(window.chrome.permissions.request).toBeCalledWith({
          permissions: ['topSites'],
        }, jasmine.any(Function));
        expect(window.chrome.permissions.remove).toBeCalledWith({
          permissions: ['management'],
        }, jasmine.any(Function));
      });
    });

    it('should create a `permissionsGranted` action and/or a `permissionsRevoked` action, depending on whether permissions were actually granted or not', () => {
      window.chrome.permissions.request = jest.fn((key, cb) => {
        if (key === 'apps') {
          cb(true);
        }
        else if (key === 'topSites') {
          cb(false);
        }
      });

      const oldPermissions = {
        apps: false,
        topSites: false,
      };
      const newPermissions = {
        apps: true,
        topSites: true,
      };

      utils.__tests__.changePermissions(newPermissions, oldPermissions)
      .then(() => {
        jest.runAllTimers();

        expect(actionCreators.permissionsGranted).toBeCalledWith(['apps']);
        expect(actionCreators.permissionsRevoked).toBeCalledWith(['topSites']);
      });
    });

    it('should create a `setConfig` action if a permission requested to be granted did not get accepted by the user or if there was an error when revoking', () => {
      window.chrome.permissions.request = jest.fn((key, cb) => cb(false));
      window.chrome.permissions.remove = jest.fn((key, cb) => cb(false));

      const oldPermissions = {
        apps: true,
        topSites: false,
        bookmarks: false,
      };
      const newPermissions = {
        apps: false,
        topSites: true,
        bookmarks: false,
      };

      utils.__tests__.changePermissions(newPermissions, oldPermissions)
      .then(() => {
        jest.runAllTimers();

        expect(actionCreators.permissionsGranted).not.toBeCalled();
        expect(actionCreators.permissionsRevoked).not.toBeCalled();
        expect(actionCreators.setConfig).toBeCalledWith({
          features: {
            apps: true,
            topSites: false,
            bookmarks: false,
          },
        });
      });
    });

    it('should not create the `setConfig` action if all permissions requested got granted', () => {
      window.chrome.permissions.request = jest.fn((key, cb) => cb(true));
      window.chrome.permissions.remove = jest.fn((key, cb) => cb(true));

      const oldPermissions = {
        apps: true,
        topSites: false,
      };
      const newPermissions = {
        apps: false,
        topSites: true,
      };

      utils.__tests__.changePermissions(newPermissions, oldPermissions)
      .then(() => {
        jest.runAllTimers();

        expect(actionCreators.setConfig).not.toBeCalled();
      });
    });
  });

  describe('`setConfig()` - Function that returns a new state for `ConfigStore` based on a record of changes to settings', () => {
    beforeEach(() => {
      storageHelpers.setInStorage - jest.fn();
      actionCreators.permissionsGranted = jest.fn();
      actionCreators.permissionsRevoked = jest.fn();
      actionCreators.setConfig = jest.fn();

      window.chrome = {
        permissions: {
          request: jest.fn(),
          remove: jest.fn(),
        },
      };
    });

    it('should return current state if nothing has changed', () => {
      const state = new ConfigStoreState({
        searchEngine: new SearchEngineRecord({
          name: 'Google',
          url: 'https://google.com/search?q=',
        }),
      });

      expect(utils.setConfig({}, state)).toBe(state);
    });

    it('should merge the `features` property of the `changes` object with the state\'s `features` property', () => {
      const state = new ConfigStoreState({
        features: {
          apps: true,
          topSites: false,
        },
        searchEngine: new SearchEngineRecord({
          name: 'Google',
          url: 'https://google.com/search?q=',
        }),
      });
      const callResult = utils.setConfig({
        features: {
          topSites: true,
          bookmarks: false,
        },
      }, state);

      expect(callResult.toJS()).toEqual({
        features: {
          apps: true,
          topSites: true,
          bookmarks: false,
        },
        searchEngine: {
          name: 'Google',
          url: 'https://google.com/search?q=',
        },
        ready: false,
      });
    });

    it('should set the `searchEngine` property of state with an object, based on a string with a name of the search engine', () => {
      const state = new ConfigStoreState({
        searchEngine: new SearchEngineRecord({
          name: 'Google',
          url: 'https://google.com/search?q=',
        }),
      });
      const callResult = utils.setConfig({searchEngine: 'Bing'}, state);

      expect(callResult.toJS()).toEqual({
        features: undefined,
        searchEngine: {
          name: 'Bing',
          url: 'https://bing.com/search?q=',
        },
        ready: false,
      });
    });

    it('should call `storageHelpers.setInStorage()` with an object based on the new state value', () => {
      storageHelpers.setInStorage = jest.fn();

      const state = new ConfigStoreState({
        features: {
          apps: true,
        },
        searchEngine: new SearchEngineRecord({
          name: 'Google',
          url: 'https://google.com/search?q=',
        }),
      });
      const callResult = utils.setConfig({
        features: {
          topSites: true,
        },
        searchEngine: 'DuckDuckGo',
      }, state);

      expect(callResult.toJS()).toEqual({
        features: {
          apps: true,
          topSites: true,
        },
        searchEngine: {
          name: 'DuckDuckGo',
          url: 'https://duckduckgo.com/?q=',
        },
        ready: false,
      });
      expect(storageHelpers.setInStorage).toBeCalledWith({
        config: {
          features: {
            apps: true,
            topSites: true,
          },
          searchEngine: 'DuckDuckGo',
        },
      });
    });
  });
});
