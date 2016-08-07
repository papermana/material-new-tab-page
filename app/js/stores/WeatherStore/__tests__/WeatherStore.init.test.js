jest.unmock('@stores/WeatherStore/WeatherStore.init');
jest.unmock('@stores/WeatherStore/WeatherStore.dataTypes');

const Immutable = require('immutable');
const init = require('@stores/WeatherStore/WeatherStore.init');
const actionCreators = require('@js/actionCreators');
const storageHelpers = require('@utils/chromeStorageHelpers');

describe('`WeatherStore.init.js` - An init function for `WeatherStore`', () => {
  function getInitAction() {
    return actionCreators.initWeatherStore;
  }

  function getActionData() {
    return getInitAction().mock.calls[0][0];
  }

  const TIMETOWAIT = 1000 * 60 * 60 * 4;

  beforeEach(() => {
    actionCreators.initWeatherStore = jest.fn();
    storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(undefined));
    storageHelpers.setInStorage = jest.fn();
    window.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => {},
    }));
    Date.now = jest.fn();
    window.test = jest.fn();
  });

  it('should try to extract saved weather data from local storage first', () => {
    return init()
    .then(() => {
      expect(storageHelpers.getFromStorage).toBeCalledWith('weatherData');
    });
  });

  it('should try to fetch weather data if there\'s no `lastChecked` property in storage', () => {
    return init()
    .then(() => {
      expect(window.fetch).toBeCalled();
    });
  });

  it('should NOT fetch data if there is `lastChecked` property in storage and the difference between it and the current time (as a Unix timestamp) is larger than a set threshold', () => {
    const lastChecked = 1;

    storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(Immutable.fromJS({
      lastChecked,
    })));
    Date.now = jest.fn(() => lastChecked + TIMETOWAIT - 1);

    return init()
    .then(() => {
      expect(window.fetch).not.toBeCalled();
    });
  });

  it('should try to fetch the data if sufficient time has passed since the last fetch', () => {
    const lastChecked = 1;

    storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(Immutable.fromJS({
      lastChecked,
    })));
    Date.now = jest.fn(() => lastChecked + TIMETOWAIT);

    return init()
    .then(() => {
      expect(window.fetch).toBeCalled();
    });
  });

  it('should throw an error if `fetch()` responds with an object whose property `ok` is not truthy', () => {
    window.fetch = jest.fn(string => {
      return new Promise((resolve, reject) => {
        if (string.includes('/weather?q=')) {
          resolve({
            ok: false,
            json() {
              return {
                foo: 'bar',
              };
            },
          });
        }
        else {
          resolve({
            ok: true,
            json() {
              return {
                foo: 'bar',
              };
            },
          });
        }
      });
    });

    return init()
    .then(() => {
      expect('This promise should not resolve').toBe(true);
    })
    .catch(e => {
      expect(e).toEqual(new Error('Failed to receive weather data for today'));
    });
  });

  it('should create the `initWeatherStore` action in a situation when it doesn\'t fetch, and pass the data it got from storage', () => {
    const lastChecked = 1;
    const storageData = Immutable.fromJS({
      lastChecked,
      today: undefined,
      forecast: undefined,
    });

    storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(storageData));
    Date.now = jest.fn(() => lastChecked + TIMETOWAIT - 1);

    return init()
    .then(() => {
      expect(getInitAction()).toBeCalledWith(storageData);
    });
  });

  it('should include the responses it get\'s from `fetch()` in the data it sends along the action `initWeatherStore`, and subsequently set it in storage', () => {
    const now = 123456;

    Date.now = jest.fn(() => now);
    window.fetch = jest.fn(string => {
      return new Promise((resolve, reject) => {
        if (string.includes('/weather?q=')) {
          resolve({
            ok: true,
            json() {
              return {
                today: 'test',
              };
            },
          });
        }
        else {
          resolve({
            ok: true,
            json() {
              return {
                forecast: [
                  'test',
                  'test2',
                  'test3',
                ],
              };
            },
          });
        }
      });
    });

    return init()
    .then(() => {
      const data = new Immutable.Map()
      .set('lastChecked', now)
      .set('today', Immutable.fromJS({
        today: 'test',
      }))
      .set('forecast', Immutable.fromJS({
        forecast: [
          'test',
          'test2',
          'test3',
        ],
      }));

      expect(getActionData()).toEqual(data);
      expect(storageHelpers.setInStorage).toBeCalledWith({
        weatherData: data,
      });
    });
  });
});
