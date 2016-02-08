import {Action, Reducer, StoreCreator} from './interfaces';

import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import {Operator} from 'rxjs/Operator';

//store specific operators
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

const ActionTypes = {
  SET_STATE: '@@ngrx/setState',
  INIT: '@@ngrx/init'
}

export class Store<T> extends BehaviorSubject<T> {

  private _storeSubscription: Subscription<T>;
  private _reducer: Reducer<any>
  
  constructor(_reducer: Reducer<T>, initialState: T) {
    super(_reducer(initialState, {type: ActionTypes.INIT}));
    this._reducer = _reducer;
  }

  next(action:any){
    const currentState = this.value;
    const newState = this._reducer(currentState, action);
    super.next(newState);
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

  replaceReducer(reducer:Reducer<any>){
    this._reducer = reducer;
    this.dispatch({type: ActionTypes.INIT});
  }

  getState(){
    return this.value;
  }
}

export const createStore = (reducer, initialState?:any) => {
  return {useValue:new Store(reducer, initialState)}
}
