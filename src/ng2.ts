import {provide, OpaqueToken, Provider, Injector} from '@angular/core';

import { Reducer } from './reducer';
import { Dispatcher } from './dispatcher';
import { Store } from './store';
import { State } from './state';
import { combineReducers } from './utils';


export const INITIAL_REDUCER = new OpaqueToken('ngrx/store/reducer');
export const INITIAL_STATE = new OpaqueToken('ngrx/store/initial-state');


const dispatcherProvider = provide(Dispatcher, {
  useFactory() {
    return new Dispatcher();
  }
});

const storeProvider = provide(Store, {
  deps: [Dispatcher, Reducer, State, INITIAL_STATE],
  useFactory(dispatcher: Dispatcher, reducer: Reducer, state$: State<any>, initialState: any) {
      return new Store<any>(dispatcher, reducer, state$, initialState);
  }
});

const stateProvider = provide(State, {
  deps: [INITIAL_STATE, Dispatcher, Reducer],
  useFactory(initialState: any, dispatcher: Dispatcher, reducer: Reducer) {
    return new State(initialState, dispatcher, reducer);
  }
});

const reducerProvider = provide(Reducer, {
  deps: [ Dispatcher, INITIAL_REDUCER ],
  useFactory(dispatcher: Dispatcher, reducer: any) {
    return new Reducer(dispatcher, reducer);
  }
});



export function provideStore(reducer: any, initialState?: any) {
  return [
    provide(INITIAL_REDUCER, {
      useFactory() {
        if (typeof reducer === 'function') {
          return reducer;
        }

        return combineReducers(reducer);
      }
    }),
    provide(INITIAL_STATE, {
      deps: [ INITIAL_REDUCER ],
      useFactory(reducer) {
        if (initialState === undefined) {
          return reducer(undefined, { type: Dispatcher.INIT });
        }

        return initialState;
      }
    }),
    dispatcherProvider,
    storeProvider,
    stateProvider,
    reducerProvider
  ];
}
