import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {ReflectiveInjector} from '@angular/core';

import {Dispatcher, State, Reducer, Action, provideStore, StoreModule} from '../';


describe('ngRx State', () => {
  const Reducer = { reduce: t => t };
  const initialState = 123;
  let injector: ReflectiveInjector;
  let state: State<number>;
  let dispatcher: Dispatcher;

  beforeEach(() => {
    spyOn(Reducer, 'reduce').and.callThrough();

    injector = ReflectiveInjector.resolveAndCreate([
      StoreModule.provideStore(Reducer.reduce, initialState).providers
    ]);

    state = injector.get(State);
    dispatcher = injector.get(Dispatcher);
  });

  it('should call the reducer to scan over the dispatcher', function() {

    state.subscribe();

    expect(Reducer.reduce).toHaveBeenCalledWith(initialState, { type: Dispatcher.INIT });

  });

});
