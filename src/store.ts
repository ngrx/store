import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {provide} from 'angular2/core';
import {Operator} from 'rxjs/Operator';

import 'rxjs/Rx';

export interface Action {
  type: string;
  payload?: any;
}

export interface Reducer<T> {
  (state: T, action: Action): T;
}

export class Store<T> extends BehaviorSubject<T> {
	private _storeSubscription: Subscription<T>
	constructor(private _dispatcher:Dispatcher<Action>, private _reducers:{[key:string]:Reducer<any>}, initialState: T) {
    super(initialState);
    let rootReducer = this._mergeReducers(_reducers, initialState);
    this._storeSubscription = rootReducer.subscribe(this);
	}

  /**
   * It allows to add or update a reducer and its initial state on the fly
   * It can be used when you need to load new parts of your store that are
   * not available when the Store is created at startup
   * @param reducer the function(s) to be added
   * @param initialState the optional dictionary representing the state the new reducer
   * should assume
     */
  replaceReducer(reducer:{[key:string] : Reducer<any>}, initialState?:any){
    let newState:T = this.value;
    Object.keys(reducer).map(key => {
      newState = Object.assign(newState, { [key]: initialState[key]});
    });


    if(this._storeSubscription){
      this._dispatcher.remove(this._storeSubscription);
      this._storeSubscription = null;
    }
    this._reducers = Object.assign(this._reducers, reducer);
    let newRootReducer = this._mergeReducers(this._reducers, newState);
    this.next(newState);
    this._storeSubscription = newRootReducer.subscribe(this);

  }

  private _mergeReducers(reducers, initialState){
    const storeKeys = Object.keys(reducers);

    const _stores = Object.keys(reducers).map(key =>  {
      const reducer = reducers[key];
      let initialReducerState = initialState[key];

      if(!initialReducerState && typeof initialReducerState === 'undefined'){
        initialReducerState = reducer(undefined, {type: '__init'});
        initialState[key] = initialReducerState;
      }

      return this._dispatcher.scan(reducer, initialReducerState);
    });

    return Observable.zip(..._stores, (...values) => {
      return storeKeys.reduce((state, key, i) => {
        state[storeKeys[i]] = values[i];
        return state;
      },{});
    });

  }

  select<R>(keyOrSelector: ((state: T) => R) | string | number | symbol): Observable<R> {
    if (
      typeof keyOrSelector === 'string' ||
      typeof keyOrSelector === 'number' ||
      typeof keyOrSelector === 'symbol'
    ) {
      return this.map(state => state[keyOrSelector]).distinctUntilChanged();
    }
    else if (typeof keyOrSelector === 'function') {
      return this.map(keyOrSelector).distinctUntilChanged();
    }
    else {
      throw new TypeError(
        `Store@select Unknown Parameter Type: `
        + `Expected type of function or valid key type, got ${typeof keyOrSelector}`
      );
    }
  }

  dispatch(action: Action): void {
    this._dispatcher.next(action);
  }

  createAction(type: string): (payload?: any) => void {
    return (payload?: any) => {
      this.dispatch({ type, payload });
    };
  }
}

export class Dispatcher<Action> extends Subject<Action> {
  dispatch(action: Action): void {
    this.next(action);
  }
}

export const provideStore = (reducers: { [key: string]: Reducer<any> }, initialState: { [key: string]: any } = {}): any[] => {

  return [
    Dispatcher,
    provide(Store, { useFactory: createStore(reducers, initialState), deps: [Dispatcher] }),
  ];

};

export const createStore = (reducers: { [key: string]: Reducer<any> }, initialState: { [key: string]: any } = {}) => {
	return (dispatcher:Dispatcher<any>) => {
    return new Store(dispatcher, reducers, initialState);
  }
}
