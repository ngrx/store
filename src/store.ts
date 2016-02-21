import {Action, Reducer, StoreCreator} from './interfaces';
import {combineReducers} from './utils'

import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {Operator} from 'rxjs/Operator';

//store specific operators
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/do';


//public injectable dispatcher
export class Dispatcher extends Subject<any> {
  dispatch(action) {
    this.next(action);
  }
}

const createActionStream = dispatcher => dispatcher;




export class Store<T> extends BehaviorSubject<T> {
  private _sub: Subscription;
  private _rootReducer: Reducer<any>;
  private _reducers: any;
  private _dispatcher: Dispatcher;
  constructor(_dispatcher: Dispatcher, _reducers: any, initialState = {}) {
    const rootReducer = combineReducers(_reducers);
    super(rootReducer(initialState, { type: '@@ngrx/INIT' }));
    this._rootReducer = rootReducer;
    this._reducers = _reducers;
    this._dispatcher = _dispatcher;
    this.initialize(this.value);
  }

  initialize(initialState) {
    if (this._sub) {
      this._sub.unsubscribe();
    }
    this._sub = this._dispatcher.scan(this._rootReducer, initialState).subscribe(state => super.next(state));
  }

  next(action: any) {
    this._dispatcher.next(action);
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
    this.next(action);
  }

  replaceReducers(reducers: any) {
    this._reducers = Object.assign({}, this._reducers, reducers);
    this._rootReducer = combineReducers(this._reducers);
    let newState = this._rootReducer(Object.assign({}, this.value), { type: '@@init' });
    this.initialize(newState);
    super.next(newState);
  }

  getState() {
    return this.value;
  }
}




export const provideStoreFn = (provide) => (reducers: any, initialState?: any) => {

  const createInternalStore = (dispatcher) => {
    return new Store(dispatcher, reducers, initialState);
  }


  const providedStore = provide(Store, { useFactory: createInternalStore, deps: [Dispatcher] })


  return [Dispatcher, providedStore];

}
