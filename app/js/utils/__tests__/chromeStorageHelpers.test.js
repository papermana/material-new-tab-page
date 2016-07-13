jest.unmock('@utils/chromeStorageHelpers');

const helpers = require('@utils/chromeStorageHelpers.js');

describe('`chromeStorageHelper.js` - Helpers for interacting with Chrome\'s sync storage API', () => {
  beforeEach(() => {
    window.chrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn(),
          clear: jest.fn(),
          remove: jest.fn(),
        },
      },
    };
  });

  it('should always return Promises', () => {
    const getResult = helpers.getFromStorage();
    const setResult = helpers.setInStorage();
    const clearResult = helpers.clearWholeStorage();
    const removeResult = helpers.removeFromStorage();

    expect(getResult instanceof Promise).toBe(true);
    expect(setResult instanceof Promise).toBe(true);
    expect(clearResult instanceof Promise).toBe(true);
    expect(removeResult instanceof Promise).toBe(true);
  });

  describe('`getFromStorage()` - A function that retrieves a given key from storage', () => {
    it('should call `chrome.storage.sync.get()` with a value it gets as its only argument and a callback function', () => {
      helpers.getFromStorage('key');

      expect(window.chrome.storage.sync.get).toBeCalledWith('key', jasmine.any(Function));
    });

    it('should return a Promise which resolves to the value returned from the call to `chrome.storage.sync.get()`', () => {
      window.chrome.storage.sync.get = jest.fn((key, cb) => cb({key: 'value'}));

      return helpers.getFromStorage('key')
      .then(returnValue => expect(returnValue).toBe('value'));
    });
  });

  describe('`setInStorage()` - A function that sets a given value in storage', () => {
    it('should call `chrome.storage.sync.set()` with a value it gets in its only argument and a callback function', () => {
      const arg = {key: 'value'};

      helpers.setInStorage(arg);

      expect(window.chrome.storage.sync.set).toBeCalledWith(arg, jasmine.any(Function));
    });

    it('should return a Promise which resolves with no value', () => {
      window.chrome.storage.sync.set = jest.fn((key, cb) => cb());

      return helpers.setInStorage({key: 'value'})
      .then(returnValue => expect(returnValue).toBeUndefined);
    });
  });

  describe('`removeFromStorage()` - A function that removes selected key or keys from storage', () => {
    it('should call `chrome.storage.sync.remove()` with a value it gets as its only argument and a callback function', () => {
      helpers.removeFromStorage('key');

      expect(window.chrome.storage.sync.remove).toBeCalledWith('key', jasmine.any(Function));
    });

    it('should return a Promise which resolves with no value', () => {
      window.chrome.storage.sync.remove = jest.fn((keyOrKeys, cb) => cb());

      return helpers.removeFromStorage('key')
      .then(returnValue => expect(returnValue).toBeUndefined());
    });
  });

  describe('`clearWholeStorage()` - A function that clears the whole storage', () => {
    it('should call `chrome.storage.sync.clear()` with a callback function', () => {
      helpers.clearWholeStorage();

      expect(window.chrome.storage.sync.clear).toBeCalledWith(jasmine.any(Function));
    });

    it('should return a Promise which resolves with no value', () => {
      window.chrome.storage.sync.clear = jest.fn(cb => cb());

      return helpers.clearWholeStorage()
      .then(returnValue => expect(returnValue).toBeUndefined());
    });
  });
});
