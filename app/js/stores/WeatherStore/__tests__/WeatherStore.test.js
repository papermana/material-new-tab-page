jest.unmock('@stores/WeatherStore');
jest.unmock('immutable');
jest.unmock('@stores/WeatherStore/WeatherStore.dataTypes');

const Immutable = require('immutable');
const {
  WeatherStoreState: WeatherStoreStateRecord,
} = require('@stores/WeatherStore/WeatherStore.dataTypes');
let dispatcher;
let WeatherStore;
let callback;

describe('`WeatherStore` - Store responsible for retrieving and storing a weather forecast', () => {
  beforeEach(() => {
    //  Order is important here:
    dispatcher = require('@js/dispatcher');
    dispatcher.register = jest.fn();
    dispatcher.isDispatching = jest.fn(() => true);
    WeatherStore = require('@stores/WeatherStore');
    callback = dispatcher.register.mock.calls[0][0];

    //  About `dispatcher.isDispatching()`: we shouldn't have to mock that, but for some reason it causes issues when returning a modified state in the store. The issue and the solution are described here: http://stackoverflow.com/questions/33499761/error-invariant-violation-store-emitchange-must-be-invoked-while-dispatch.
  });

  it('registers a callback with the dispatcher', () => {
    expect(dispatcher.register.mock.calls.length).toBe(1);
  });

  it('initializes with an `Immutable.Record` containing a property `ready` with a value of `false`', () => {
    const state = WeatherStore.getState();

    expect(Immutable.is(state, new WeatherStoreStateRecord({
      lastChecked: undefined,
      today: undefined,
      forecast: undefined,
      ready: false,
    }))).toBe(true);
  });

  it('doesn\'t do anything if an action is created that `WeatherStore` doesn\'t recongnize', () => {
    const state = WeatherStore.getState();

    callback({
      type: 'fake',
    });

    //  Not just `toEqual()`, but to actually preserve the reference.
    expect(WeatherStore.getState()).toBe(state);
  });

  it('calls `WeatherStore.init` upon receiving the `permissionsGranted` action that includes a `weather` property set to `true`; then returns state unchanged', () => {
    const init = require('@stores/WeatherStore/WeatherStore.init');
    const state = WeatherStore.getState();

    callback({
      type: 'permissionsGranted',
      data: {
        weather: true,
      },
    });

    expect(init).toBeCalled();
    expect(WeatherStore.getState()).toBe(state);
  });

  it('doesn\'t do anything if the `permissionsGranted` action doesn\t have a property `weather` set to `true`', () => {
    const init = require('@stores/AppsStore/AppsStore.init');
    const state = WeatherStore.getState();

    callback({
      type: 'permissionsGranted',
      data: {},
    });

    expect(init).not.toBeCalled();
    expect(WeatherStore.getState()).toBe(state);
  });

  it('merges data it receives from the `initWeatherStore` action into state, and sets the property `ready` to `true`', () => {
    callback({
      type: 'initWeatherStore',
      data: {
        lastChecked: 1469048452874,
        today: [],
        forecast: [
          'foo',
          'bar',
        ],
      },
    });

    expect(WeatherStore.getState().toJS()).toEqual({
      lastChecked: 1469048452874,
      today: [],
      forecast: [
        'foo',
        'bar',
      ],
      ready: true,
    });
  });

  it('changes its state back to empty (with a `ready` property set to `false`) upon receiving the `permissionsRevoked` action with the `weather` property set to `true`', () => {
    callback({
      type: 'initWeatherStore',
      data: {
        lastChecked: 1469048452874,
        today: [],
        forecast: [
          'foo',
          'bar',
        ],
      },
    });

    const state = WeatherStore.getState();

    callback({
      type: 'permissionsRevoked',
      data: {
        weather: true,
      },
    });

    expect(WeatherStore.getState().toJS()).not.toEqual(state.toJS());
    expect(WeatherStore.getState().toJS()).toEqual({
      lastChecked: undefined,
      today: undefined,
      forecast: undefined,
      ready: false,
    });
  });

  it('doesn\t do anything if the `permissionsRevoked` action doesn\t have the `weather` property set to `true`', () => {
    callback({
      type: 'initWeatherStore',
      data: {
        lastChecked: 1469048452874,
        today: [],
        forecast: [
          'foo',
          'bar',
        ],
      },
    });

    const state = WeatherStore.getState();

    callback({
      type: 'permissionsRevoked',
      data: {},
    });

    expect(WeatherStore.getState()).toBe(state);
  });
});
