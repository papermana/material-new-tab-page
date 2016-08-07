jest.unmock('@stores/WeatherStore/WeatherStore.init');
jest.unmock('@stores/WeatherStore/WeatherStore.dataTypes');

const Immutable = require('immutable');
const init = require('@stores/WeatherStore/WeatherStore.init');
const actionCreators = require('@js/actionCreators');
const {
  WeatherStoreState: WeatherStoreStateRecord,
} = require('@stores/WeatherStore/WeatherStore.dataTypes');

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

    window.fetch = jest.fn();
    Date.now = jest.fn();
    window.test = jest.fn();
  });

  it('shouldn create the `initWeatherStore` action with the unchanged state it got invoked with if the difference between current time (as a Unix timestamp) and the `lastChecked` property in state is bigger than a set amount', () => {
    const state = new WeatherStoreStateRecord({
      lastChecked: 1,
    });

    Date.now = jest.fn(() => state.lastChecked + TIMETOWAIT - 1);

    init(state);

    expect(getInitAction()).toBeCalledWith(state);
  });

  it('should call `fetch()` if enough time has passed', () => {
    const state = new WeatherStoreStateRecord({
      lastChecked: 1,
    });

    Date.now = jest.fn(() => state.lastChecked + TIMETOWAIT);
    window.fetch = jest.fn(() => {
      return new Promise((resolve, reject) => {
        resolve({
          ok: true,
          json() {
            return {
              foo: 'bar',
            };
          },
        });
      });
    });

    init(state);

    expect(window.fetch).toBeCalled();
  });

  it('should throw an error if `fetch()` responds with an object whose property `ok` is not truthy', () => {
    const state = new WeatherStoreStateRecord({
      lastChecked: 1,
    });

    Date.now = jest.fn(() => state.lastChecked + TIMETOWAIT);
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

    init(state);

    return window.test.mock.calls[0][0]
    .then(() => {
      expect('This promise should not resolve').toBe(true);
    })
    .catch(e => {
      expect(e).toEqual(new Error('Failed to receive weather data for today'));
    });
  });

  it('should include the responses it get\'s from `fetch()` in the data it sends along the action `initWeatherStore`', () => {
    const state = new WeatherStoreStateRecord({
      lastChecked: 1,
    });

    Date.now = jest.fn(() => state.lastChecked + TIMETOWAIT);
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

    init(state);

    return window.test.mock.calls[0][0]
    .then(() => {
      const newState = state
      .set('lastChecked', state.lastChecked + TIMETOWAIT)
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

      expect(Immutable.is(getActionData(), newState)).toBe(true);
    });
  });
});
