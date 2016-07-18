jest.unmock('@stores/ConfigStore');
jest.unmock('@stores/ConfigStore/ConfigStore.dataTypes');

const Immutable = require('immutable');
const {
  ConfigStoreState: ConfigStoreStateRecord,
} = require('@stores/ConfigStore/ConfigStore.dataTypes');
let dispatcher;
let ConfigStore;
let callback;
let utils;


describe('`ConfigStore` - Store responsible for retrieving saved config from storage, providing defaults, and applying changes to it', () => {
  beforeEach(() => {
    //  Order is important here:
    dispatcher = require('@js/dispatcher');
    dispatcher.register = jest.fn();
    dispatcher.isDispatching = jest.fn(() => true);
    ConfigStore = require('@stores/ConfigStore');
    callback = dispatcher.register.mock.calls[0][0];
    utils = require('@stores/ConfigStore/ConfigStore.utils');

    //  About `dispatcher.isDispatching()`: we shouldn't have to mock that, but for some reason it causes issues when returning a modified state in the store. The issue and the solution are described here: http://stackoverflow.com/questions/33499761/error-invariant-violation-store-emitchange-must-be-invoked-while-dispatch.
  });

  it('registers a callback with the dispatcher', () => {
    expect(dispatcher.register.mock.calls.length).toBe(1);
  });

  it('initializes with an `Immutable.Record` containing a property `ready` with a value of `false`', () => {
    const state = ConfigStore.getState();

    expect(Immutable.is(state, new ConfigStoreStateRecord({
      features: undefined,
      searchEngine: undefined,
      ready: false,
    }))).toBe(true);
  });

  it('doesn\'t do anything if an action is created that `ConfigStore` doesn\'t recongnize', () => {
    const state = ConfigStore.getState();

    callback({
      type: 'fake',
    });

    //  Not just `toEqual()`, but to actually preserve the reference.
    expect(ConfigStore.getState()).toBe(state);
  });

  it('calls `utils.init()` on startup', () => {
    expect(utils.init).toBeCalled();
  });

  it('should, upon receiving the `initConfigStore` action, create a `permissionsGranted` action passing data from `action.data.features`, and return state modified with data received', () => {
    const actionCreators = require('@js/actionCreators');

    const data = {
      features: {
        apps: true,
      },
      searchEngine: 'foo',
    };

    callback({
      type: 'initConfigStore',
      data,
    });

    jest.runAllTimers();

    expect(Immutable.is(ConfigStore.getState(), new ConfigStoreStateRecord({
      features: Immutable.fromJS(data.features),
      searchEngine: data.searchEngine,
      ready: true,
    }))).toBe(true);
    expect(actionCreators.permissionsGranted).toBeCalledWith(data.features);
  });

  it('should, upon receiving a `setConfig` action, call `utils.setConfig()` and merge the returned value into state', () => {
    const state = ConfigStore.getState();
    const actionData = {
      foo: 'bar',
    };
    const returnData = {
      features: 'baz',
    };

    utils.setConfig = jest.fn(() => returnData);

    callback({
      type: 'setConfig',
      data: actionData,
    });

    expect(utils.setConfig).toBeCalledWith(actionData, state);
    expect(Immutable.is(ConfigStore.getState(), new ConfigStoreStateRecord({
      features: 'baz',
      searchEngine: undefined,
      ready: false,
    }))).toBe(true);
  });
});
