declare var describe, it, expect, hot, cold, expectObservable, expectSubscriptions, console;

import 'reflect-metadata';
import {provideStore, Store, Dispatcher} from '../src/store';
import {Observable} from 'rxjs/Observable';
import {Injector, provide} from 'angular2/core';

import {counterStore, INCREMENT, DECREMENT, RESET} from './fixtures/counter';

interface TestAppSchema {
  counter: number;
}


let injector:Injector;
let store:Store<TestAppSchema>;
let dispatcher:Dispatcher;

beforeEach(() => {
  
  injector = Injector.resolveAndCreate([
    provideStore(Store, {counter: counterStore}, {counter: 0})
  ]);
  
  store = injector.get(Store);
  dispatcher = injector.get(Dispatcher);

});

describe('ngRx Store', () => {
  
  it('should provide an Observable Store', () => {
    expect(store).toBeDefined();
  });
});

describe('basic store actions', function () {
  
  it('should increment and decrement the counter', function () {
    
    const actionSequence = '--a--b--c--d--e';
    const actionValues = {
      a: {type: INCREMENT}, //1
      b: {type: INCREMENT}, //2
      c: {type: DECREMENT}, //1
      d: {type: RESET},     //0
      e: {type: INCREMENT}  //1
    };
    
    const counterSteps = hot(actionSequence, actionValues);
    
    counterSteps.subscribe((action) => store.dispatch(action));
    
    const counterState = store.select('counter');
    
    const stateSequence = '--v--w--x--y--z';
    const stateValues = { v:1, w:2, x:1, y:0, z:1 }
   
   expectObservable(counterState).toBe(stateSequence, stateValues);
    
  });
});