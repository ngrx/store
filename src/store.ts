import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {provide} from 'angular2/core';
import {Operator} from 'rxjs/Operator';

import 'rxjs/Rx';

export interface Action {
	type:string,
	payload?:any;
}

export interface Reducer<T> {
	(state: T, action: Action): T
}

export class Store<T> extends BehaviorSubject<T> {
	
	constructor(initialState:T, private _dispatcher:Subject<Action>, private reducer:any){
		super(initialState);
		_dispatcher.scan(reducer, initialState).subscribe(this);
	}
	
	select <T, R>(key: string): Observable<R> {
		return this.map(state => state[key]).distinctUntilChanged();
	}
	
	dispatch(action:Action):void{
		this._dispatcher.next(action);
	}
}

export class Dispatcher<Action> extends Subject<Action> {
	dispatch(action:Action){
		this.next(action);
	}
}

export const provideStore = (reducers:{[key:string]:Reducer<any>}, initialState:{[key:string]:any} = {}):any[] => {
	
	return [
		provide(Store, {useFactory: createStore(reducers, initialState), deps: [Dispatcher]}),
		Dispatcher
	];

}

const combineReducers = (reducers) => {
	return (state, action) => {
		return Object.keys(reducers).reduce((newState, key) => {
			newState[key] = reducers[key](state[key], action);
			return newState;
		},{});
	}
}


export const createStore = (reducers:{[key:string]:Reducer<any>}, initialState:{[key:string]:any} = {}) => {
	return (dispatcher: Subject<Action>) => {
	
		
		let store = new Store(initialState, dispatcher, combineReducers(reducers));
	
		return store;	
	}
}
