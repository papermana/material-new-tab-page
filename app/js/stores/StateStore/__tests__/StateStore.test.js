jest.unmock('@stores/StateStore');
jest.unmock('@stores/StateStore/StateStore.dataTypes');

const Immutable = require('immutable');
const {
  StateStoreState: StateStoreStateRecord,
} = require('@stores/StateStore/StateStore.dataTypes');
let dispatcher;
let StateStore;
let callback;
let utils;

describe('`StateStore` - Store responsible for keeping the current state of the application', () => {
  beforeEach(() => {
    //  Order is important here:
    dispatcher = require('@js/dispatcher');
    dispatcher.register = jest.fn();
    dispatcher.isDispatching = jest.fn(() => true);
    StateStore = require('@stores/StateStore');
    callback = dispatcher.register.mock.calls[0][0];
    utils = require('@stores/StateStore/StateStore.utils');
    utils.searchFunc = jest.fn();

    //  About `dispatcher.isDispatching()`: we shouldn't have to mock that, but for some reason it causes issues when returning a modified state in the store. The issue and the solution are described here: http://stackoverflow.com/questions/33499761/error-invariant-violation-store-emitchange-must-be-invoked-while-dispatch.
  });

  it('registers a callback with the dispatcher', () => {
    expect(dispatcher.register.mock.calls.length).toBe(1);
  });

  it('initializes with an `Immutable.Record` containing a property `ready` with a value of `true`', () => {
    const state = StateStore.getState();

    expect(Immutable.is(state, new StateStoreStateRecord({
      navStack: Immutable.Stack(),
      searchResults: Immutable.List(),
      ready: true,
    }))).toBe(true);
  });

  it('doesn\'t do anything if an action is created that `AppsStore` doesn\'t recongnize', () => {
    const state = StateStore.getState();

    callback({
      type: 'fake',
    });

    //  Not just `toEqual()`, but to actually preserve the reference.
    expect(StateStore.getState()).toBe(state);
  });

  it('should, upon receiving the action `goTo`, add the string passed as the data to the front of the `navStack`; on receiving the action `goBack`, it should remove the added value from stack', () => {
    expect(StateStore.getState().navStack.size).toBe(0);

    callback({
      type: 'goTo',
      data: 'someState',
    });

    expect(StateStore.getState().navStack.size).toBe(1);
    expect(StateStore.getState().navStack.peek()).toBe('someState');

    callback({
      type: 'goBack',
    });

    expect(StateStore.getState().navStack.size).toBe(0);
  });

  it('should, upon receiving the action `setSearchValue`, cal `utils.searchFunc` with the value it gets, and return the state unchanged', () => {
    const state = StateStore.getState();

    callback({
      type: 'setSearchValue',
      data: 'some query',
    });

    expect(utils.searchFunc).toBeCalledWith('some query');
    expect(StateStore.getState()).toBe(state);
  });

  it('should, upon receiving the action `setSearchResults`, set the property `searchResults` with the value taken from the attached data', () => {
    callback({
      type: 'setSearchResults',
      data: Immutable.List([{foo: 'bar'}]),
    });

    const results = StateStore.getState().searchResults;

    expect(Immutable.is(results, Immutable.List([{foo: 'bar'}])));
  });
});
