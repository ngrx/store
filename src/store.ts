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
	_reducer: Reducer<any>;
	constructor(reducer:Reducer<any>, initialState:T){
		
		super(initialState);
		this._reducer = reducer;
	}
	
	select <T, R>(key: string): Observable<R> {
		return this.map(state => state[key]).distinctUntilChanged();
	}
	
	next(action:any){
		super.next(this._reducer(this.value, action));
	}
	
	dispatch(action:Action):void{
		this.next(action);
	}
}

export class Dispatcher<Action> extends Subject<Action> {
	dispatch(action:Action){
		this.next(action);
	}
}

export const provideStore = (reducers:{[key:string]:Reducer<any>}, initialState:{[key:string]:any} = {}):any[] => {
	
	return [
		provide(Store, {useFactory: createStore(reducers, initialState) }),
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
	return () => {
	
		
		let store = new Store(combineReducers(reducers), initialState);
	
		return store;	
	}
}
