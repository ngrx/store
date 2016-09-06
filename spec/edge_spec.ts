declare var describe, fit, it, expect, hot, cold, expectObservable, expectSubscriptions, console, beforeEach;
require('es6-shim');
require('reflect-metadata');
import {Store, Dispatcher, State, Action, combineReducers} from '../src/index';
import {StoreModule} from '../src/ng2';
import {Observable} from 'rxjs/Observable';
import {ReflectiveInjector } from '@angular/core';

import {todos, todoCount} from './fixtures/edge_todos';

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

      injector = ReflectiveInjector.resolveAndCreate([
        StoreModule.provideStore({ todos, todoCount }).providers
      ]);

      store = injector.get(Store);
      dispatcher = injector.get(Dispatcher);
    });

    it('should provide an Observable Store', () => {
      expect(store).toBeDefined();
    });

    it('should handle re-entrancy', (done) => {

      let todosNextCount = 0;
      let todosCountNextCount = 0;

      store.select('todos').subscribe((todos: any[]) => {
        todosNextCount++
        store.dispatch({ type: 'SET_COUNT', payload: todos.length })
      });

      store.select('todoCount').subscribe(count => {
        todosCountNextCount++;
      });

      store.dispatch({ type: 'ADD_TODO', payload: { name: 'test' } });
      expect(todosNextCount).toBe(2);
      expect(todosCountNextCount).toBe(2);

      setTimeout(() => {
        expect(todosNextCount).toBe(2);
        expect(todosCountNextCount).toBe(2);
        done();
      }, 10);

    });
  });
});
