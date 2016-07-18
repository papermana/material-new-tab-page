jest.unmock('@stores/AppsStore');
jest.unmock('immutable');
jest.unmock('@stores/AppsStore/appsStoreDataTypes');

const Immutable = require('immutable');
const {
  AppsStoreState: AppsStoreStateRecord,
} = require('@stores/AppsStore/appsStoreDataTypes');
let dispatcher;
let AppsStore;
let callback;

describe('`AppsStore` - Store responsible for retrieving a list of apps from Chrome and storing it', () => {
  beforeEach(() => {
    //  Order is important here:
    dispatcher = require('@js/dispatcher');
    dispatcher.register = jest.fn();
    dispatcher.isDispatching = jest.fn(() => true);
    AppsStore = require('@stores/AppsStore');
    callback = dispatcher.register.mock.calls[0][0];

    //  About `dispatcher.isDispatching()`: we shouldn't have to mock that, but for some reason it causes issues when returning a modified state in the store. The issue and the solution are described here: http://stackoverflow.com/questions/33499761/error-invariant-violation-store-emitchange-must-be-invoked-while-dispatch.
  });

  it('registers a callback with the dispatcher', () => {
    expect(dispatcher.register.mock.calls.length).toBe(1);
  });

  it('initializes with an `Immutable.Record` containing a property `ready` with a value of `false`', () => {
    const state = AppsStore.getState();

    expect(Immutable.is(state, new AppsStoreStateRecord({
      allApps: undefined,
      favoriteApps: undefined,
      ready: false,
    }))).toBe(true);
  });

  it('doesn\'t do anything if an action is created that `AppsStore` doesn\'t recongnize', () => {
    const state = AppsStore.getState();

    callback({
      type: 'fake',
    });

    //  Not just `toEqual()`, but to actually preserve the reference.
    expect(AppsStore.getState()).toBe(state);
  });

  it('calls `appsStoreInit` upon receiving the `permissionsGranted` action that includes an `apps` property set to `true`; then returns state unchanged', () => {
    const init = require('@stores/AppsStore/appsStoreInit');
    const state = AppsStore.getState();

    callback({
      type: 'permissionsGranted',
      data: {
        apps: true,
      },
    });

    expect(init).toBeCalled();
    expect(AppsStore.getState()).toBe(state);
  });

  it('doesn\'t do anything if the `permissionsGranted` action doesn\t have a property `apps` set to `true`', () => {
    const init = require('@stores/AppsStore/appsStoreInit');
    const state = AppsStore.getState();

    callback({
      type: 'permissionsGranted',
      data: {},
    });

    expect(init).not.toBeCalled();
    expect(AppsStore.getState()).toBe(state);
  });

  it('sets properties `apps` and `favoriteApps` in the state to values it received from the `initAppsStore` action, and the property `ready` to `true`', () => {
    callback({
      type: 'initAppsStore',
      data: {
        allApps: [{id: 1, name: 'test'}],
        favoriteApps: [1],
      },
    });

    expect(AppsStore.getState().toJS()).toEqual({
      apps: [{id: 1, name: 'test'}],
      favoriteApps: [1],
      ready: true,
    });
  });

  it('changes its state back to empty (with a `ready` property set to `false`) upon receiving the `permissionsRevoked` action with the `apps` property set to `true`', () => {
    callback({
      type: 'initAppsStore',
      data: {
        allApps: [{id: 1, name: 'test'}],
        favoriteApps: [1],
      },
    });

    const state = AppsStore.getState();

    callback({
      type: 'permissionsRevoked',
      data: {
        apps: true,
      },
    });

    expect(AppsStore.getState().toJS()).not.toEqual(state.toJS());
    expect(AppsStore.getState().toJS()).toEqual({
      apps: undefined,
      favoriteApps: undefined,
      ready: false,
    });
  });

  it('doesn\t do anything if the `permissionsRevoked` action doesn\t have the `apps` property set to `true`', () => {
    callback({
      type: 'initAppsStore',
      data: {
        allApps: [{id: 1, name: 'test'}],
        favoriteApps: [1],
      },
    });

    const state = AppsStore.getState();

    callback({
      type: 'permissionsRevoked',
      data: {},
    });

    expect(AppsStore.getState()).toBe(state);
  });
});
