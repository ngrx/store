declare var describe, it, expect, hot, cold, expectObservable, expectSubscriptions, console;
require('es6-shim');
import 'reflect-metadata';
import {provideStore, Store, Dispatcher, Action} from '../src/store';
import {Observable} from 'rxjs/Observable';
import {Injector, provide} from 'angular2/core';

import {counterReducer, INCREMENT, DECREMENT, RESET} from './fixtures/counter';

interface TestAppSchema {
  counter1: number;
  counter2: number;
  counter3: number;
}

interface Todo { }

interface TodoAppSchema {
  visibilityFilter: string;
  todos: Todo[];
}



describe('ngRx Store', () => {

  describe('basic store actions', function() {

    let injector: Injector;
    let store: Store<TestAppSchema>;
    let dispatcher: Dispatcher<Action>;

    beforeEach(() => {

      injector = Injector.resolveAndCreate([
        provideStore({ counter1: counterReducer, counter2: counterReducer, counter3: counterReducer }, { counter1: 0, counter2: 1 })
      ]);

      store = injector.get(Store);
      dispatcher = injector.get(Dispatcher);
    });

    it('should provide an Observable Store', () => {
      expect(store).toBeDefined();
    });

    const actionSequence = '--a--b--c--d--e';
    const actionValues = {
      a: { type: INCREMENT },
      b: { type: INCREMENT },
      c: { type: DECREMENT },
      d: { type: RESET },
      e: { type: INCREMENT }
    };

    it('should let you select state with a key name or selector function', function() {

      const counterSteps = hot(actionSequence, actionValues);

      counterSteps.subscribe((action) => store.dispatch(action));

      const counterStateWithString = store.select('counter1');
      const counterStateWithFunc = store.select(s => s.counter1);

      const stateSequence = 'i-v--w--x--y--z';
      const counter1Values = { i: 0, v: 1, w: 2, x: 1, y: 0, z: 1 };

      expectObservable(counterStateWithString).toBe(stateSequence, counter1Values);
      expectObservable(counterStateWithFunc).toBe(stateSequence, counter1Values);

    });

    it('should throw a type error if you attempt to select state without a valid key name or selector function', function() {

      const select = value => () => store.select(value);

      expect(select(undefined)).toThrowError(TypeError, /got undefined/);
      expect(select({})).toThrowError(TypeError, /got object/);
      expect(select(true)).toThrowError(TypeError, /got boolean/);

    });

    it('should appropriately handle initial state', () => {

      expect(store.value).toEqual({ counter1: 0, counter2: 1, counter3: 0 });

    });


    it('should appropriately handle initial state via subscription', () => {
      store.subscribe(initialState => {
        expect(initialState).toEqual({ counter1: 0, counter2: 1, counter3: 0 });
      });
    });

    it('should increment and decrement counter1', function() {

      const counterSteps = hot(actionSequence, actionValues);

      counterSteps.subscribe((action) => store.dispatch(action));

      const counterState = store.select('counter1');

      const stateSequence = 'i-v--w--x--y--z';
      const counter1Values = { i: 0, v: 1, w: 2, x: 1, y: 0, z: 1 };

      expectObservable(counterState).toBe(stateSequence, counter1Values);

    });

    it('should increment and decrement counter1 using the dispatcher', function() {

      const counterSteps = hot(actionSequence, actionValues);

      counterSteps.subscribe((action) => dispatcher.dispatch(action));

      const counterState = store.select('counter1');

      const stateSequence = 'i-v--w--x--y--z';
      const counter1Values = { i: 0, v: 1, w: 2, x: 1, y: 0, z: 1 };

      expectObservable(counterState).toBe(stateSequence, counter1Values);

    });

    it('should increment and decrement counter1 using a created action', function() {

      const counterSteps = hot(actionSequence, actionValues);

      const incrementAction = store.createAction(INCREMENT);
      const decrementAction = store.createAction(DECREMENT);
      const resetAction = store.createAction(RESET);

      counterSteps.subscribe((action) => {
        switch (action.type) {
          case INCREMENT:
            incrementAction();
            break;
          case DECREMENT:
            decrementAction();
            break;
          case RESET:
            resetAction();
            break;

        }
      });



      const counterState = store.select('counter1');

      const stateSequence = 'i-v--w--x--y--z';
      const counter1Values = { i: 0, v: 1, w: 2, x: 1, y: 0, z: 1 };

      expectObservable(counterState).toBe(stateSequence, counter1Values);

    });

    it('should increment and decrement counter2 separately', function() {

      const counterSteps = hot(actionSequence, actionValues);

      counterSteps.subscribe((action) => store.dispatch(action));

      const counter1State = store.select('counter1');
      const counter2State = store.select('counter2');

      const stateSequence = 'i-v--w--x--y--z';
      const counter1Values = { i: 0, v: 1, w: 2, x: 1, y: 0, z: 1 };
      const counter2Values = { i: 1, v: 2, w: 3, x: 2, y: 0, z: 1 };

      expectObservable(counter1State).toBe(stateSequence, counter1Values);
      expectObservable(counter2State).toBe(stateSequence, counter2Values);

    });

    it('should only push values when they change when .select() is used', function() {

      const actionSequence = '--a--b--c--d--e';
      const actionValues = {
        a: { type: INCREMENT },
        b: { type: INCREMENT },
        c: { type: 'SOME_IRRELEVANT VALUE_THING' },
        d: { type: RESET },
        e: { type: INCREMENT }
      };

      const counterSteps = hot(actionSequence, actionValues);

      counterSteps.subscribe((action) => store.dispatch(action));

      const counter1State = store.select(s => s.counter1);

      const stateSequence = 'i-v--w-----y--z';
      const counter1Values = { i: 0, v: 1, w: 2, y: 0, z: 1 };


      expectObservable(counter1State).toBe(stateSequence, counter1Values);

    });

    it('should allow you to add a reducer later', function() {

      let currentState;

      store.subscribe(state => {
        currentState = state;
      });

      expect(currentState).toEqual({counter1: 0, counter2: 1, counter3: 0});
      store.dispatch({type: INCREMENT});
      expect(currentState).toEqual({counter1: 1, counter2: 2, counter3: 1});

      store.replaceReducer({'dynamicCounter' : counterReducer}, {'dynamicCounter' : 1});

      expect(currentState).toEqual({counter1: 1, counter2: 2, counter3: 1, dynamicCounter: 1});

      store.dispatch({type: INCREMENT});

      expect(currentState).toEqual({counter1: 2, counter2: 3, counter3: 2, dynamicCounter: 2});

    });

    it('should allow you to update a reducer later', function() {

      let currentState;

      store.subscribe(state => {
        currentState = state;
      });

      expect(currentState).toEqual({counter1: 0, counter2: 1, counter3: 0});
      store.dispatch({type: INCREMENT});
      expect(currentState).toEqual({counter1: 1, counter2: 2, counter3: 1});

      let replacedReducers:{[key:string] : any} = {};
      replacedReducers['counter3'] = counterReducer;
      replacedReducers['counter2'] = counterReducer;

      let replacedState = {};
      replacedState['counter3'] = 1;
      // the state of 'counter2' is omitted to test that the initial state is optional

      store.replaceReducer(replacedReducers, replacedState);

      expect(currentState).toEqual({counter1: 1, counter2: 0, counter3:1});

      store.dispatch({type: INCREMENT});

      expect(currentState).toEqual({counter1: 2, counter2: 1, counter3: 2});

    });
  });
});
