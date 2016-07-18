jest.unmock('@stores/AppsStore/appsStore.init');
jest.unmock('@stores/AppsStore/appsStore.dataTypes');

const init = require('@stores/AppsStore/appsStore.init');
const actionCreators = require('@js/actionCreators');
const storageHelpers = require('@utils/chromeStorageHelpers');
const {
  App: AppRecord,
} = require('@stores/AppsStore/appsStore.dataTypes');

describe('`appsStore.init.js` - An init function for initializing `AppsStore`', () => {
  function mockGetAll(results) {
    window.chrome = {
      management: {
        getAll: jest.fn(cb => cb(results)),
      },
    };
  }

  function getGetAll() {
    return window.chrome.management.getAll;
  }

  function getInitAction() {
    return actionCreators.initAppsStore;
  }

  function getActionData() {
    return getInitAction().mock.calls[0][0];
  }

  const webstoreObject = new AppRecord({
    id: 'chrome-web-store',
    name: 'Chrome Web Store',
    description: 'Get more apps at Google Web Store!',
    url: 'https://chrome.google.com/webstore/category/apps',
    icon: 'assets/chrome_web_store.png',
  });

  beforeEach(() => {
    mockGetAll([]);

    actionCreators.initAppsStore = jest.fn();

    storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(undefined));
  });

  it('should call the Chrome API to get a list of all extensions, themes and apps installed, and pass a function as an argument', () => {
    return init()
    .then(() => {
      expect(getGetAll()).toBeCalled();
      expect(getGetAll()).toBeCalledWith(jasmine.any(Function));
    });
  });

  it('should create an action at the end of its run, and pass an object as data', () => {
    return init()
    .then(() => {
      expect(getInitAction()).toBeCalled();
      expect(getInitAction()).toBeCalledWith(jasmine.any(Object));
    });
  });

  it('should create an object containing two properties: `allApps` and `favoriteApps`, which should both be arrays', () => {
    return init()
    .then(() => {
      expect(getActionData().allApps).toBeDefined();
      expect(getActionData().allApps).toEqual(jasmine.any(Array));
      expect(getActionData().favoriteApps).toBeDefined();
      expect(getActionData().favoriteApps).toEqual(jasmine.any(Array));
    });
  });

  it('should always push a Chrome Web Store "app" to the end of the list of `allApps`', () => {
    return init()
    .then(() => {
      expect(getActionData().allApps).toEqual([webstoreObject]);
    });
  });

  it('should ignore any extensions and themes', () => {
    mockGetAll([
      {type: 'extension'},
      {type: 'theme'},
      {type: 'extension'},
    ]);

    return init()
    .then(() => {
      expect(getActionData().allApps).toEqual([webstoreObject]);
    });
  });

  it('should format end results', () => {
    mockGetAll([
      {
        id: 1,
        name: 'test test test',
        enabled: true,
        type: 'packaged_app',
        icons: [{
          size: 128,
          url: 'assets/test',
        }],
      },
      {
        id: 2,
        shortName: 'test2',
        description: 'test2 description',
        enabled: true,
        type: 'hosted_app',
        appLaunchUrl: 'http://some.url',
        icons: [{
          size: 128,
          url: 'assets/test2',
        }],
      },
    ]);

    return init()
    .then(() => {
      expect(getActionData().allApps).toEqual([
        new AppRecord({
          id: 1,
          name: 'test test test',
          description: 'test test test',
          url: undefined,
          icon: 'assets/test',
        }),
        new AppRecord({
          id: 2,
          name: 'test2',
          description: 'test2 description',
          url: 'http://some.url',
          icon: 'assets/test2',
        }),
        webstoreObject,
      ]);
    });
  });

  it('should include url\'s to icons whose size is equal to the preferred size, or else the biggest possible', () => {
    //  This just has to be manually synced with `appsStore.init.js`:
    const PREFERRED_SIZE = 128;

    mockGetAll([
      {
        id: 1,
        enabled: true,
        type: 'packaged_app',
        icons: [
          {size: 64, url: 'size64'},
          {size: 128, url: 'size128'},
          {size: 256, url: 'size256'},
        ],
      },
      {
        id: 2,
        enabled: true,
        type: 'packaged_app',
        icons: [
          {size: 64, url: 'size64'},
          {size: 256, url: 'size256'},
        ],
      },
    ]);

    return init()
    .then(() => {
      expect(getActionData().allApps).toEqual([
        new AppRecord({id: 1, icon: 'size' + PREFERRED_SIZE}),
        new AppRecord({id: 2, icon: 'size256'}),
        webstoreObject,
      ]);
    });
  });

  it('should include id\'s of `allApps` by default in the `favoriteApps` property', () => {
    mockGetAll([
      {
        id: 1,
        name: 'test',
        enabled: true,
        type: 'packaged_app',
        icons: [{
          size: '128',
          url: 'assets/test',
        }],
      },
      {
        id: 2,
        name: 'test2',
        description: 'test2 description',
        enabled: true,
        type: 'hosted_app',
        appLaunchUrl: 'http://some.url',
        icons: [{
          size: '128',
          url: 'assets/test2',
        }],
      },
    ]);

    return init()
    .then(() => {
      expect(getActionData().favoriteApps).toEqual([
        1,
        2,
        webstoreObject.id,
      ]);
    });
  });

  it('should include just Chrome Web Store "app\'s" id when no apps are found', () => {
    return init()
    .then(() => {
      expect(getActionData().favoriteApps).toEqual([webstoreObject.id]);
    });
  });

  it('should only include id\'s of the first twelve apps if more exists in `allApps`', () => {
    mockGetAll([
      {type: 'hosted_app', enabled: true, id: 1, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 2, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 3, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 4, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 5, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 6, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 7, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 8, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 9, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 10, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 11, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 12, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 13, icons: [
        {size: 64, url: 'i'},
      ]},
    ]);

    return init()
    .then(() => {
      expect(getActionData().favoriteApps.length).toEqual(12);
      expect(getActionData().favoriteApps).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      ]);
    });
  });

  it('should tolerate apps without any icons, and should include them in `favoriteApps` if there are less than twelve apps total', () => {
    mockGetAll([
      {
        id: 1,
        enabled: true,
        type: 'hosted_app',
        icons: [{size: 128, url: 'icon'}],
      },
      {
        id: 2,
        enabled: true,
        type: 'hosted_app',
        icons: [{size: 128, url: 'icon2'}],
      },
      {
        id: 3,
        enabled: true,
        type: 'hosted_app',
      },
    ]);

    return init()
    .then(() => {
      expect(getActionData().allApps).toEqual([
        new AppRecord({id: 1, icon: 'icon'}),
        new AppRecord({id: 2, icon: 'icon2'}),
        new AppRecord({id: 3, icon: undefined}),
        webstoreObject,
      ]);
      expect(getActionData().favoriteApps).toEqual([
        1, 2, 3, webstoreObject.id,
      ]);
    });
  });

  it('should tolerate apps without any icons, but should not include them in `favoriteApps` if there are more than twelve apps total, including Webstore', () => {
    mockGetAll([
      {type: 'hosted_app', enabled: true, id: 1, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 2, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 3, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 4, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 5, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 6, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 7, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 8, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 9, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 10, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 11, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 12},
    ]);

    return init()
    .then(() => {
      expect(getActionData().favoriteApps.length).toEqual(12);
      expect(getActionData().favoriteApps).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, webstoreObject.id,
      ]);
    });
  });

  it('should tolerate apps without any icons, and if there are more than twelve apps total, but lwess than twelve apps with icons, it should pad the `favoriteApps` array with them, placing them at the end', () => {
    mockGetAll([
      {type: 'hosted_app', enabled: true, id: 1},
      {type: 'hosted_app', enabled: true, id: 2},
      {type: 'hosted_app', enabled: true, id: 3, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 4, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 5, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 6, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 7, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 8, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 9, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 10, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 11, icons: [
        {size: 64, url: 'i'},
      ]},
      {type: 'hosted_app', enabled: true, id: 12},
    ]);

    return init()
    .then(() => {
      expect(getActionData().favoriteApps.length).toEqual(12);
      expect(getActionData().favoriteApps).toEqual([
        3, 4, 5, 6, 7, 8, 9, 10, 11, webstoreObject.id, 1, 2,
      ]);
    });
  });

  it('should return the list of id\'s from Chrome\'s sync storage if any is available', () => {
    const mockFavorites = [
      11, 12, 37, 48, 'test',
    ];

    storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(mockFavorites));

    return init()
    .then(() => {
      expect(getActionData().favoriteApps).toEqual(mockFavorites);
    });
  });

  it('should only ever contain 12 id\'s, even if Chrome\'s sync storage for some reason has more than that', () => {
    const mockFavorites = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    ];

    storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(mockFavorites));

    return init()
    .then(() => {
      expect(getActionData().favoriteApps.length).toEqual(12);
      expect(getActionData().favoriteApps).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      ]);
    });
  });
});
