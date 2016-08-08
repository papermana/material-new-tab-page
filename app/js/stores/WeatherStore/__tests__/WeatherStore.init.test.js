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
      if (options.argument.includes('/weather?q=')) {
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

  const TIMETOWAIT = 1000 * 60 * 60 * 4;

  beforeEach(() => {
    actionCreators.initWeatherStore = jest.fn();
    storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(undefined));
    storageHelpers.setInStorage = jest.fn();
    window.fetch = jest.fn(arg => mockFetch({argument: arg}));
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

    storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(JSON.stringify({
      lastChecked,
      today: {},
      forecast: [],
    })));
    Date.now = jest.fn(() => lastChecked + TIMETOWAIT - 1);

    return init()
    .then(() => {
      expect(window.fetch).not.toBeCalled();
    });
  });

  it('should try to fetch the data if sufficient time has passed since the last fetch', () => {
    const lastChecked = 1;

    storageHelpers.getFromStorage = jest.fn(() => Promise.resolve(JSON.stringify({
      lastChecked,
      today: {},
      forecast: [],
    })));
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

    storageHelpers.getFromStorage = jest.fn(() => {
      return Promise.resolve(JSON.stringify(storageData));
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
});
