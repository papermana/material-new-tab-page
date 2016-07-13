/**
  Returns the value of a single key from Chrome's sync storage.
  @param {string} key - A key from storage
  @returns {Promise} - A Promise resolving to the value of given key in storage, or undefined if the key cannot be found
*/
function getFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, items => {
      if (items[key]) {
        resolve(items[key]);
      }
      else {
        resolve(undefined);
      }
    });
  });
}

/**
  Sets content of Chrome's sync storage.
  @param {Object} items - An object containing key/value pairs to update storage with
  @returns {Promise} - A Promise which resolves (with no value) after the values have been set
*/
function setInStorage(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(items, () => resolve());
  });
}

/**
  Removes a specific key of keys from Chrome's sync Storage.
  @param {string|Array.<string>} keyOrKeys - A key or a list of keys to be deleted from storage
  @returns {Promise} - A Promise which resolves (with no value) after selected keys have been removed from storage
*/
function removeFromStorage(keyOrKeys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(keyOrKeys, () => resolve());
  });
}

/**
  Clears the entirety of Chrome's sync storage.
  @returns {Promise} - A Promise which resolves (with no value) after storage has been cleared
*/
function clearWholeStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.clear(() => resolve());
  });
}


module.exports = {
  getFromStorage,
  setInStorage,
  clearWholeStorage,
  removeFromStorage,
};
