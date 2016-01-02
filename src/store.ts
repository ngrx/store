import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {provide} from 'angular2/core';
import {Operator} from 'rxjs/Operator';

import 'rxjs/Rx';

export interface Action {
	type: string,
	payload?: any;
}

export interface Reducer<T> {
	(state: T, action: Action): T
}

export class Store<T> extends BehaviorSubject<T> {
	_reducer: Reducer<any>;
	constructor(private _dispatcher:Dispatcher<Action>, initialState: T) {
    super(initialState);
	}

	select<R>(keyOrSelector: ((state: T) => R) | string | number | symbol): Observable<R> {
		if(
			typeof keyOrSelector === 'string' || 
			typeof keyOrSelector === 'number' || 
			typeof keyOrSelector === 'symbol'
		){
			return this.map(state => state[keyOrSelector]).distinctUntilChanged();
		}
		else if(typeof keyOrSelector === 'function'){
			return this.map(keyOrSelector).distinctUntilChanged();
		}
		else{
			throw new TypeError(
				  `Store@select Unknown Parameter Type: `
				+ `Expected type of function or valid key type, got ${typeof keyOrSelector}`
			);
		}
	}
  
  dispatch(action: Action): void {
		this._dispatcher.next(action)
	}

  createAction(type: string): (payload?:any) => void {
    return (payload?:any) => {
      this.dispatch({type, payload});
    }
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

}

export const createStore = (reducers: { [key: string]: Reducer<any> }, initialState: { [key: string]: any } = {}) => {
	return (dispatcher:Dispatcher<any>) => {
    
    const storeKeys = Object.keys(reducers);

    const _stores = Object.keys(reducers).map(key =>  {
      const reducer = reducers[key];
      let initialReducerState = initialState[key];

      if(!initialReducerState && typeof initialReducerState === 'undefined'){
        initialReducerState = reducer(undefined, {type: '__init'});
        initialState[key] = initialReducerState;
      }

      return dispatcher.scan(reducer, initialReducerState);
    });
    
    const store = new Store(dispatcher, initialState);

    Observable.zip(..._stores, (...values) => {
      return storeKeys.reduce((state, key, i) => {
        state[storeKeys[i]] = values[i];
        return state;
      },{});
    }).subscribe(store);

    return store;
	}
}
