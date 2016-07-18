jest.unmock('@stores/TopSitesStore');
jest.unmock('@stores/TopSitesStore/TopSitesStore.dataTypes');

const Immutable = require('immutable');
const {
  TopSitesStoreState: TopSitesStoreStateRecord,
} = require('@stores/TopSitesStore/TopSitesStore.dataTypes');
let dispatcher;
let TopSitesStore;
let callback;

describe('`TopSitesStore` - Store responsible for retrieving a list of most visited sites from Chrome and storing it', () => {
  beforeEach(() => {
    //  Order is important here:
    dispatcher = require('@js/dispatcher');
    dispatcher.register = jest.fn();
    dispatcher.isDispatching = jest.fn(() => true);
    TopSitesStore = require('@stores/TopSitesStore');
    callback = dispatcher.register.mock.calls[0][0];

    //  About `dispatcher.isDispatching()`: we shouldn't have to mock that, but for some reason it causes issues when returning a modified state in the store. The issue and the solution are described here: http://stackoverflow.com/questions/33499761/error-invariant-violation-store-emitchange-must-be-invoked-while-dispatch.
  });

  it('registers a callback with the dispatcher', () => {
    expect(dispatcher.register.mock.calls.length).toBe(1);
  });

  it('initializes with an `Immutable.Record` containing a property `ready` set to `false`', () => {
    const state = TopSitesStore.getState();

    expect(Immutable.is(state, new TopSitesStoreStateRecord({
      sites: undefined,
      ready: false,
    })));
  });

  it('doesn\t do anything if an action is created that `topSitesStore` doesn\t recognize', () => {
    const state = TopSitesStore.getState();

    callback({
      type: 'fake',
    });

    //  Not just `toEqual()`, but to actually preserve the reference.
    expect(TopSitesStore.getState()).toBe(state);
  });

  it('calls `topSitesStore.init` upon receiving the `permissionsGranted` action that includes a property `topSites` set to `true`; then returns state unchanged', () => {
    const init = require('@stores/TopSitesStore/TopSitesStore.init');
    const state = TopSitesStore.getState();

    callback({
      type: 'permissionsGranted',
      data: {
        topSites: true,
      },
    });

    expect(init).toBeCalled();
    expect(TopSitesStore.getState()).toBe(state);
  });

  it('doesn\'t do anything if the `permissionsGranted` action doesn\t have a property `topSites` set to `true`', () => {
    const init = require('@stores/TopSitesStore/TopSitesStore.init');
    const state = TopSitesStore.getState();

    callback({
      type: 'permissionsGranted',
      data: {},
    });

    expect(init).not.toBeCalled();
    expect(TopSitesStore.getState()).toBe(state);
  });

  it('sets the property `sites` in the state to the value it received from the `initTopSitesStore` action, and the property `ready` to `true`', () => {
    callback({
      type: 'initTopSitesStore',
      data: [{title: 'test-title', url: 'test-url'}],
    });

    expect(TopSitesStore.getState().toJS()).toEqual({
      sites: [{title: 'test-title', url: 'test-url'}],
      ready: true,
    });
  });

  it('changes its state back to empty (with a `ready` property set to `false`) upon receiving the `permissionsRevoked` action with the `topSites` property set to `true`', () => {
    callback({
      type: 'initTopSitesStore',
      data: [{title: 'test-title', url: 'test-url'}],
    });

    const state = TopSitesStore.getState();

    callback({
      type: 'permissionsRevoked',
      data: {
        topSites: true,
      },
    });

    expect(TopSitesStore.getState().toJS()).not.toEqual(state.toJS());
    expect(TopSitesStore.getState().toJS()).toEqual({
      sites: undefined,
      ready: false,
    });
  });

  it('doesn\t do anything if the `permissionsRevoked` action doesn\t have the `topSites` property set to `true`', () => {
    callback({
      type: 'initTopSitesStore',
      data: [{title: 'test-title', url: 'test-url'}],
    });

    const state = TopSitesStore.getState();

    callback({
      type: 'permissionsRevoked',
      data: {},
    });

    expect(TopSitesStore.getState()).toBe(state);
  });
});
