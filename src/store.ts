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
	constructor(private _dispatcher, initialState: T) {
    super(initialState);
	}

	select<T, R>(key: string): Observable<R> {
		return this.map(state => state[key]).distinctUntilChanged();
	}
  
  dispatch(action: Action): void {
		this._dispatcher.next(action)
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

const combineReducers = (reducers: { [key: string]: Reducer<any> }) => {
	return (state, action: Action) => {
		return Object.keys(reducers).reduce((newState, key) => {
			newState[key] = reducers[key](state[key], action);
			return newState;
		}, {});
	}
}

export const createStore = (reducers: { [key: string]: Reducer<any> }, initialState: { [key: string]: any } = {}) => {
	return (dispatcher:Subject<any>) => {

    const storeKeys = Object.keys(reducers);
    const initialStateKeys = Object.keys(initialState);
    //creates an object of observables
    const _stores = Object.keys(reducers).map(key => {

      return dispatcher.scan(reducers[key],initialState[key])

    });

    const store = new Store(dispatcher, initialState);

    Observable.zip(..._stores, (...values) => {
      return storeKeys.reduce((state, key, i) => {
        state[storeKeys[i]] = values[i];
        return state;
      },{})
    }).subscribe(store);

    return store;
	}
}
