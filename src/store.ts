import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/subject/ReplaySubject';
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

export class Store<T> extends ReplaySubject<T> {
	
	constructor(private _dispatcher:Subject<Action>){
		super(1);
	}
	
	select <T>(key: string): Observable<T> {
		return this.map(state => state[key]).distinctUntilChanged();
	}
	
	dispatch(action:Action):void{
		this._dispatcher.next(action);
	}
}

export class Dispatcher {
	dispatch(action:Action){}
}

export const provideStore = (token:any, reducers:{[key:string]:Reducer<any>}, initialState:{[key:string]:any} = {}):any => {
	
	return [
		provide(token, {useFactory: createStore(reducers, initialState), deps: [Dispatcher]}),
		provide(Dispatcher, {useClass: Subject })];

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
		
		let state = dispatcher.scan(combineReducers(reducers),initialState);
		
		let store = new Store(dispatcher);
		
		state.subscribe(store);
	
		return store;	
	}
}
