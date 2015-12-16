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
}

interface Todo {}

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
        provideStore({ counter1: counterReducer, counter2: counterReducer }, { counter1: 0, counter2: 1 })
      ]);

      store = injector.get(Store);
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

    it('should increment and decrement counter1', function() {

      const counterSteps = hot(actionSequence, actionValues);

      counterSteps.subscribe((action) => store.dispatch(action));

      const counterState = store.select('counter1');

      const stateSequence = 'i-v--w--x--y--z';
      const counter1Values = { i: 0, v: 1, w: 2, x: 1, y: 0, z: 1 }

      expectObservable(counterState).toBe(stateSequence, counter1Values);

    });

    it('should increment and decrement counter2 separately', function() {

      const counterSteps = hot(actionSequence, actionValues);

      counterSteps.subscribe((action) => store.dispatch(action));

      const counter1State = store.select('counter1');
      const counter2State = store.select('counter2');

      const stateSequence = 'i-v--w--x--y--z';
      const counter1Values = { i: 0, v: 1, w: 2, x: 1, y: 0, z: 1 }
      const counter2Values = { i: 1, v: 2, w: 3, x: 2, y: 0, z: 1 }

      expectObservable(counter1State).toBe(stateSequence, counter1Values);
      expectObservable(counter2State).toBe(stateSequence, counter2Values);

    });
    
    it('should only push values when they change', function() {
      
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

      const counter1State = store.select('counter1');
      
      const stateSequence = 'i-v--w-----y--z';
      const counter1Values = { i: 0, v: 1, w: 2, y: 0, z: 1 }
      

      expectObservable(counter1State).toBe(stateSequence, counter1Values);

    });
    
  });

});