import {provide, OpaqueToken, Provider, Injector} from 'angular2/core';

import {Reducer, ActionReducer} from './reducer';
import {Dispatcher} from './dispatcher';
import {Store} from './store';
import {compose, combineReducers} from './utils';
import {State} from './state';

export const INITIAL_REDUCER = new OpaqueToken('ngrx/store/reducer');
export const INITIAL_STATE = new OpaqueToken('ngrx/store/initial-state');

const dispatcherProvider = provide(Dispatcher, {
  useFactory() {
    return new Dispatcher();
  }
});

const storeProvider = provide(Store, {
  deps: [Dispatcher, Reducer, State],
  useFactory(dispatcher$: Dispatcher, reducer$: Reducer, state$: State<any>) {
      return new Store<any>(dispatcher$, reducer$, state$);
  }
});

const stateProvider = provide(State, {
  deps: [Reducer, Dispatcher, INITIAL_STATE],
  useFactory(
    reducer$: Reducer,
    dispatcher: Dispatcher,
    initialState: any
  ) {
    return new State(reducer$, dispatcher, initialState);
  }
});

const reducerProvider = provide(Reducer, {
  deps: [INITIAL_REDUCER, Dispatcher],
  useFactory(initialReducer: ActionReducer<any>, dispatcher: Dispatcher) {
    return new Reducer(initialReducer, dispatcher);
  }
});

export function provideStore(reducer: any, initialState?: any) {
  return [
    provide(INITIAL_REDUCER, { useValue: reducer }),
    provide(INITIAL_STATE, {
      deps: [ INITIAL_REDUCER ],
      useFactory(reducer: ActionReducer<any>) {
        if (initialState === undefined) {
          return reducer(initialState, { type: Dispatcher.INIT });
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
