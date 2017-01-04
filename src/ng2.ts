import { OpaqueToken, NgModule, ModuleWithProviders } from '@angular/core';

import { Reducer } from './reducer';
import { Dispatcher } from './dispatcher';
import { Store } from './store';
import { State } from './state';
import { combineReducers } from './utils';

export const INITIAL_REDUCER = new OpaqueToken('Token ngrx/store/reducer');
export const INITIAL_STATE = new OpaqueToken('Token ngrx/store/initial-state');

export const _INITIAL_REDUCER = new OpaqueToken('Token _ngrx/store/reducer');
export const _INITIAL_STATE = new OpaqueToken('Token _ngrx/store/initial-state');

export function _initialReducerFactory(reducer) {
  if (typeof reducer === 'function') {
    return reducer;
  }
  return combineReducers(reducer);
}

export function _initialStateFactory(initialState, reducer) {
  if (!initialState) {
    return reducer(undefined, { type: Dispatcher.INIT });
  }
  
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  
  return initialState;
}

export function _storeFactory(dispatcher, reducer, state$) {
  return new Store(dispatcher, reducer, state$);
}

export function _stateFactory(initialState: any, dispatcher: Dispatcher, reducer: Reducer) {
  return new State(initialState, dispatcher, reducer);
}

export function _reducerFactory(dispatcher, reducer) {
  return new Reducer(dispatcher, reducer);
};

/**
 * @deprecated, use StoreModule.provideStore instead!
 */
export function provideStore(_reducer: any, _initialState?: any | (() => any)): any[] {
  return [
    Dispatcher,
    { provide: Store, useFactory: _storeFactory, deps: [Dispatcher, Reducer, State] },
    { provide: Reducer, useFactory: _reducerFactory, deps: [Dispatcher, INITIAL_REDUCER] },
    { provide: State, useFactory: _stateFactory, deps: [INITIAL_STATE, Dispatcher, Reducer] },
    { provide: INITIAL_REDUCER, useFactory: _initialReducerFactory, deps: [_INITIAL_REDUCER] },
    { provide: INITIAL_STATE, useFactory: _initialStateFactory, deps: [_INITIAL_STATE, INITIAL_REDUCER] },
    { provide: _INITIAL_STATE, useValue: _initialState },
    { provide: _INITIAL_REDUCER, useValue: _reducer }
  ];
}


@NgModule({})
export class StoreModule {
  static provideStore(_reducer: any, _initialState?: any | (() => any)): ModuleWithProviders {
    return {
      ngModule: StoreModule,
      providers: provideStore(_reducer, _initialState)
    };
  }
}
