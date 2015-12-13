declare var describe, it, expect, hot, cold, expectObservable, expectSubscriptions, console;

import 'reflect-metadata';
import {provideStore, Store, Dispatcher} from '../src/store';
import {Observable} from 'rxjs/Observable';
import {Injector, provide} from 'angular2/core';

import {counterStore, INCREMENT, DECREMENT, RESET} from './fixtures/counter';

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
    let dispatcher: Dispatcher;

    beforeEach(() => {

      injector = Injector.resolveAndCreate([
        provideStore(Store, { counter1: counterStore, counter2: counterStore }, { counter1: 0, counter2: 1 })
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

    it('should increment and decrement counter1', function() {

      const counterSteps = hot(actionSequence, actionValues);

      counterSteps.subscribe((action) => store.dispatch(action));

      const counterState = store.select('counter1');

      const stateSequence = '--v--w--x--y--z';
      const counter1Values = { v: 1, w: 2, x: 1, y: 0, z: 1 }

      expectObservable(counterState).toBe(stateSequence, counter1Values);

    });

    it('should increment and decrement counter2 separately', function() {

      const counterSteps = hot(actionSequence, actionValues);

      counterSteps.subscribe((action) => store.dispatch(action));

      const counter1State = store.select('counter1');
      const counter2State = store.select('counter2');

      const stateSequence = '--v--w--x--y--z';
      const counter1Values = { v: 1, w: 2, x: 1, y: 0, z: 1 }
      const counter2Values = { v: 2, w: 3, x: 2, y: 0, z: 1 }

      expectObservable(counter1State).toBe(stateSequence, counter1Values);
      expectObservable(counter2State).toBe(stateSequence, counter2Values);

    });
  });

});