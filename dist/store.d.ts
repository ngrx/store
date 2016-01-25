import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/subject/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
export interface Action {
    type: string;
    payload?: any;
}
export interface Reducer<T> {
    (state: T, action: Action): T;
}
export declare class Store<T> extends BehaviorSubject<T> {
    private _dispatcher;
    private _reducers;
    private _storeSubscription;
    constructor(_dispatcher: Dispatcher<Action>, _reducers: {
        [key: string]: Reducer<any>;
    }, initialState: T);
    /**
     * It allows to add or update a reducer and its initial state on the fly
     * It can be used when you need to load new parts of your store that are
     * not available when the Store is created at startup
     * @param reducer the function(s) to be added
     * @param initialState the optional dictionary representing the state the new reducer
     * should assume
       */
    replaceReducer(reducer: {
        [key: string]: Reducer<any>;
    }, initialState?: any): void;
    private _mergeReducers(reducers, initialState);
    select<R>(keyOrSelector: ((state: T) => R) | string | number | symbol): Observable<R>;
    dispatch(action: Action): void;
    createAction(type: string): (payload?: any) => void;
}
export declare class Dispatcher<Action> extends Subject<Action> {
    dispatch(action: Action): void;
}
export declare const provideStore: (reducers: {
    [key: string]: Reducer<any>;
}, initialState?: {
    [key: string]: any;
}) => any[];
export declare const createStore: (reducers: {
    [key: string]: Reducer<any>;
}, initialState?: {
    [key: string]: any;
}) => (dispatcher: Dispatcher<any>) => Store<{
    [key: string]: any;
}>;
