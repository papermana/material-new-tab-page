jest.unmock('@stores/WeatherStore/WeatherStore.init');
jest.unmock('@stores/WeatherStore/WeatherStore.dataTypes');

jest.mock('moment', () => {
  return () => ({
    value: 'moment',
    startOf() {
      return {
        clone() {
          return {
            add() {
              return '2016-08-08 00:00:00';
            },
          };
        },
      };
    },
  });
});

const moment = require('moment');

moment.utc = jest.fn(() => ({
  hour() {
    return 23;
  },
  date() {
    return 'foo';
  },
}));

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

  function mockFetch(options) {
    return new Promise((resolve, reject) => {
      if (options.argument.includes('/weather?')) {
        options.today = options.today || {};

        resolve({
          ok: options.today.ok === undefined ? true : options.today.ok,
          json() {
            return {
              name: 'location',
              main: {
                temp: options.today.temp || 1,
              },
              weather: [
                {
                  main: options.today.status || 'sunny',
                  icon: options.today.icon || '01d',
                },
              ],
            };
          },
        });
      }
      else {
        options.forecast = options.forecast || {};
        options.forecast.list = options.forecast.list || [];
        options.forecast.list[0] = options.forecast.list[0] || {};

        resolve({
          ok: options.forecast.ok === undefined ? true : options.forecast.ok,
          json() {
            const list = options.forecast.list.map(entry => ({
              dt_txt: entry.time || '2016-08-07 23:00:00',
              main: {
                temp: entry.temp || 1,
              },
              weather: [
                {
                  main: entry.status || 'sunny',
                  icon: entry.icon || '01d',
                },
              ],
            }));

            return {
              list,
            };
          },
        });
      }
    });
  }

  function mockGetFromStorage(options = {}) {
    return jest.fn(argument => {
      let response;

      if (argument === 'config') {
        response = options.config || {
          useGeolocation: false,
          customLocation: 'Warsaw, PL',
        };
      }
      else if (argument === 'weatherData') {
        response = options.weatherData || undefined;
      }

      return Promise.resolve(response);
    });
  }

  const TIMETOWAIT = 1000 * 60 * 60 * 4;

  beforeEach(() => {
    actionCreators.initWeatherStore = jest.fn();
    storageHelpers.getFromStorage = mockGetFromStorage();
    storageHelpers.setInStorage = jest.fn();
    window.fetch = jest.fn(arg => mockFetch({argument: arg}));
    Date.now = jest.fn();
    window.test = jest.fn();
    window.chrome = window.chrome || {};
    window.chrome.i18n.getUILanguage = jest.fn(() => 'en');
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

    storageHelpers.getFromStorage = mockGetFromStorage({
      weatherData: JSON.stringify({
        lastChecked,
        today: {},
        forecast: [],
      }),
    });
    Date.now = jest.fn(() => lastChecked + TIMETOWAIT - 1);

    return init()
    .then(() => {
      expect(window.fetch).not.toBeCalled();
    });
  });

  it('should try to fetch the data if sufficient time has passed since the last fetch', () => {
    const lastChecked = 1;

    storageHelpers.getFromStorage = mockGetFromStorage({
      weatherData: JSON.stringify({
        lastChecked,
        today: {},
        forecast: [],
      }),
    });
    Date.now = jest.fn(() => lastChecked + TIMETOWAIT);

    return init()
    .then(() => {
      expect(window.fetch).toBeCalled();
    });
  });

  it('should throw an error if `fetch()` responds with an object whose property `ok` is not truthy', () => {
    window.fetch = jest.fn(arg => mockFetch({
      argument: arg,
      today: {
        ok: false,
      },
      forecast: {
        ok: false,
      },
    }));

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
    const storageData = {
      lastChecked,
      location: 'location',
      today: {
        temp: 10,
        status: 'rainy',
        icon: '08n',
      },
      forecast: [
        {
          date: '2016-08-07T22:00:00.000Z',
          weather: {
            temp: 15,
            status: 'rainy',
            icon: '08n',
          },
        },
        {
          date: '2016-08-08T22:00:00.000Z',
          weather: {
            temp: 20,
            status: 'rainy',
            icon: '08n',
          },
        },
      ],
    };

    storageHelpers.getFromStorage = mockGetFromStorage({
      weatherData: JSON.stringify(storageData),
    });
    Date.now = jest.fn(() => lastChecked + TIMETOWAIT - 1);

    return init()
    .then(() => {
      //  Due to the way `moment()` is mocked, it's difficult to compare objects
      //  containing results of that function.
      //  So we'll try to go around the problem:
      const actionData = getActionData().toJS();

      expect(actionData.forecast[0].date.value).toBe('moment');
      expect(actionData.forecast[1].date.value).toBe('moment');

      actionData.forecast.forEach(forecast => {
        forecast.date = 'moment';
      });
      storageData.forecast.forEach(forecast => {
        forecast.date = 'moment';
      });
      expect(actionData).toEqual(storageData);
    });
  });

  it('should include the (formatted) responses it get\'s from `fetch()` in the data it sends along the action `initWeatherStore`, and subsequently set it in storage', () => {
    const now = 123456;

    Date.now = jest.fn(() => now);
    window.fetch = jest.fn(arg => mockFetch({argument: arg}));

    return init()
    .then(() => {
      const data = new Immutable.Map()
      .set('lastChecked', now)
      .set('location', 'location')
      .set('today', Immutable.fromJS({
        temp: 1,
        status: 'sunny',
        icon: '01d',
      }))
      .set('forecast', Immutable.fromJS([
        {
          date: '2016-08-08 00:00:00',
          night: {
            temp: 1,
            status: 'sunny',
            icon: '01d',
          },
        },
      ]));

      expect(getActionData().toJS()).toEqual(data.toJS());

      const setInStorageData = storageHelpers.setInStorage.mock.calls[0][0];

      expect(JSON.parse(setInStorageData.weatherData)).toEqual(data.toJS());
    });
  });

  it('should use geolocation if it is allowed in the configuration stored, and should fetch URL based on the received coordinates', () => {
    Date.now = jest.fn(() => 123456);
    storageHelpers.getFromStorage = mockGetFromStorage({
      config: {
        useGeolocation: true,
      },
    });
    window.fetch = jest.fn(arg => mockFetch({argument: arg}));

    //  JSDom, which is used by Jest, blocks modification of some
    //  of the values attached to the global object because they're
    //  marked as `[Unforgeable]` in the spec. Therefore we need to
    //  go the extra mile to mock them like this:
    Object.defineProperty(window.navigator, 'geolocation', {
      value: {
        getCurrentPosition: jest.fn(cb => cb({
          coords: {
            latitude: 100,
            longitude: 50,
          },
        })),
      },
    });

    return init()
    .then(() => {
      expect(window.navigator.geolocation.getCurrentPosition).toBeCalled();
      expect(window.fetch.mock.calls[0][0]).toContain('?lat=100&lon=50');
    });
  });

  it('should use a city ID if `useGeolocation` is false in config and `customLocation` is a string containing digits', () => {
    Date.now = jest.fn(() => 123456);
    storageHelpers.getFromStorage = mockGetFromStorage({
      config: {
        useGeolocation: false,
        customLocation: 'ABCD1234',
      },
    });
    window.fetch = jest.fn(arg => mockFetch({argument: arg}));

    return init()
    .then(() => {
      expect(window.fetch.mock.calls[0][0]).toContain('?id=ABCD1234');
    });
  });

  it('should use a city name if `useGeolocation` in config is false and `customlocation` is a string that doesn\'t contain digits', () => {
    Date.now = jest.fn(() => 123456);
    storageHelpers.getFromStorage = mockGetFromStorage({
      config: {
        useGeolocation: false,
        customLocation: 'CityTown, AB',
      },
    });
    window.fetch = jest.fn(arg => mockFetch({argument: arg}));

    return init()
    .then(() => {
      expect(window.fetch.mock.calls[0][0]).toContain('?q=CityTown, AB');
    });
  });

  it('should throw an error if neither `useGeolocation` nor `customLocation` options are set in the config', () => {
    Date.now = jest.fn(() => 123456);
    storageHelpers.getFromStorage = mockGetFromStorage({
      config: {
        useGeolocation: false,
        customLocation: undefined,
      },
    });
    window.fetch = jest.fn(arg => mockFetch({argument: arg}));

    return init()
    .catch(e => {
      expect(e).toEqual(new Error('No weather location set'));
      expect(window.fetch).not.toBeCalled();
    });
  });

  it('should include the appriopriate language code in the URL it fetches', () => {
    Date.now = jest.fn(() => 123456);

    return init()
    .then(() => {
      expect(window.fetch.mock.calls[0][0]).toContain('&lang=en');
    });
  });
});
