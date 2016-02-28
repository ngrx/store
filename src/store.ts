import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';

import {Action, Reducer} from './interfaces';
import {StoreBackend} from './store-backend';
import {Dispatcher} from './dispatcher';

export class Store<T> extends BehaviorSubject<T> {
  constructor(
    private _dispatcher: Dispatcher<Action>,
    private _backend: StoreBackend,
    initialState?: T
  ) {
    super(initialState);

    _backend.connect(state => super.next(state));
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

  getState() {
    return this.value;
  }

  dispatch(action: Action) {
    this._dispatcher.dispatch(action);
  }

  next(action: any) {
    this._dispatcher.next(action);
  }

  error(error?: any) {
    this._dispatcher.error(error);
  }

  replaceReducer<V>(reducer: Reducer<V>) {
    this._backend.replaceReducer(reducer);
  }
}
