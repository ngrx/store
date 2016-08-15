import { Reducer } from './reducer';
import { Dispatcher } from './dispatcher';
import { Store } from './store';
import { State } from './state';
import { combineReducers } from './utils';
import { OpaqueToken } from '@angular/core';


export const INITIAL_REDUCER = new OpaqueToken('Token ngrx/store/reducer');
export const INITIAL_STATE = new OpaqueToken('Token ngrx/store/initial-state');

export const _INITIAL_REDUCER = new OpaqueToken('Token ngrx/store/reducer');
export const _INITIAL_STATE = new OpaqueToken('Token ngrx/store/initial-state');

export function _initialReducerFactory(reducer) {
  if (typeof reducer === 'function') {
    return reducer;
  }
  return combineReducers(reducer);
}
export function _initialStateFactory(initialState, reducer) {
  if (initialState === undefined) {
    return reducer(undefined, { type: Dispatcher.INIT });
  }
  return initialState;
}
export const dispatcherProvider = {
  provide: Dispatcher,
  useFactory() {
    return new Dispatcher();
  }
};

export const storeProvider = {
  provide: Store,
  deps: [Dispatcher, Reducer, State],
  useFactory(dispatcher: Dispatcher, reducer: Reducer, state$: State<any>) {
      return new Store<any>(dispatcher, reducer, state$);
  }
};

export const stateProvider = {
  provide: State,
  deps: [INITIAL_STATE, Dispatcher, Reducer],
  useFactory(initialState: any, dispatcher: Dispatcher, reducer: Reducer) {
    return new State(initialState, dispatcher, reducer);
  }
};

export const reducerProvider = {
  provide: Reducer,
  deps: [ Dispatcher, INITIAL_REDUCER ],
  useFactory(dispatcher: Dispatcher, reducer: any) {
    return new Reducer(dispatcher, reducer);
  }
};



export function provideStore(reducer: any, initialState?: any): any[] {
  return [
    {
      provide: INITIAL_REDUCER,
      useFactory: _initialReducerFactory,
      deps: [_INITIAL_REDUCER]
    },
    {
      provide: INITIAL_STATE,
      deps: [ _INITIAL_STATE, INITIAL_REDUCER ],
      useFactory: _initialStateFactory
    },
    dispatcherProvider,
    storeProvider,
    stateProvider,
    reducerProvider,
    { provide: _INITIAL_STATE, useValue: initialState },
    { provide: _INITIAL_REDUCER, useValue: reducer }
  ];
}
