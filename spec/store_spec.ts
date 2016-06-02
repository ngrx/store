declare var describe, it, expect, hot, cold, expectObservable, expectSubscriptions, console, beforeEach;
require('es6-shim');
require('reflect-metadata');
import 'rxjs/add/operator/take';
import {Store, Dispatcher, State, Action, combineReducers, provideStore} from '../src/index';
import {Observable} from 'rxjs/Observable';
import {ReflectiveInjector, provide} from '@angular/core';

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

    let injector: ReflectiveInjector;
    let store: Store<TestAppSchema>;
    let dispatcher: Dispatcher;

    beforeEach(() => {
      const rootReducer = combineReducers({
        counter1: counterReducer,
        counter2: counterReducer,
        counter3: counterReducer
      });

      const initialValue = { counter1: 0, counter2: 1 };

      injector = ReflectiveInjector.resolveAndCreate([
        provideStore(rootReducer, initialValue)
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

    it('should appropriately handle initial state', (done) => {

      store.take(1).subscribe({
        next(val) {
          expect(val).toEqual({ counter1: 0, counter2: 1, counter3: 0 });
        },
        error: done,
        complete: done
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

    it('should allow you to add a reducer later', function() {

      let currentState;

      store.subscribe(state => {
        currentState = state;
      });

      expect(currentState).toEqual({counter1: 0, counter2: 1, counter3: 0});
      store.dispatch({type: INCREMENT});
      expect(currentState).toEqual({counter1: 1, counter2: 2, counter3: 1});

      store.replaceReducer(combineReducers({ counter1: counterReducer, dynamicCounter: counterReducer}));

      expect(currentState).toEqual({ counter1: 1, dynamicCounter: 0 });

      store.dispatch({type: INCREMENT});

      expect(currentState).toEqual({ counter1: 2, dynamicCounter: 1 });

    });

    it('should implement the observer interface forwarding actions and errors to the dispatcher', function() {

      spyOn(dispatcher, 'next');
      spyOn(dispatcher, 'error');

      store.next(<any>1);
      store.error(2);

      expect(dispatcher.next).toHaveBeenCalledWith(1);
      expect(dispatcher.error).toHaveBeenCalledWith(2);

    });

    it('should not be completable', function() {

      const storeSubscription = store.subscribe();
      const dispatcherSubscription = dispatcher.subscribe();

      store.complete();
      dispatcher.complete();

      expect(storeSubscription.isUnsubscribed).toBe(false);
      expect(dispatcherSubscription.isUnsubscribed).toBe(false);
    });
  });
});
