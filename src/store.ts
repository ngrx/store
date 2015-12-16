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
	constructor(private _dispatcher, reducer: Reducer<any>, initialState: T) {

		super(reducer(initialState, { type: 'INIT__STORE' }));
		this._reducer = reducer;
		_dispatcher.subscribe(action => super.next(this._reducer(this.value, action)));
	}

	select<T, R>(key: string): Observable<R> {
		return this.map(state => state[key]).distinctUntilChanged();
	}

	next(action: any) {
		this._dispatcher.next(action)
	}

	dispatch(action: Action): void {
		this.next(action);
	}
}

export class Dispatcher<Action> extends Subject<Action> {
	dispatch(action: Action) {
		this.next(action);
	}
}

export const provideStore = (reducers: { [key: string]: Reducer<any> }, initialState: { [key: string]: any } = {}): any[] => {

	return [
		Dispatcher,
		provide(Store, { useFactory: createStore(reducers, initialState), deps: [Dispatcher] }),
	];

}

const combineReducers = (reducers) => {
	return (state, action) => {
		return Object.keys(reducers).reduce((newState, key) => {
			newState[key] = reducers[key](state[key], action);
			return newState;
		}, {});
	}
}

export const createStore = (reducers: { [key: string]: Reducer<any> }, initialState: { [key: string]: any } = {}) => {
	return (dispatcher) => {
		
		let store = new Store(dispatcher, combineReducers(reducers), initialState);

		return store;
	}
}
