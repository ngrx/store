import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/scan';

import {Dispatcher} from './dispatcher';
import {Middleware, Reducer} from './interfaces';

export const ActionTypes = {
  INIT: '@@ngrx/INIT'
};

export class StoreBackend {
  constructor(
    protected _dispatcher: Dispatcher<any>,
    protected _reducer: Reducer<any>,
    protected _initialState: any,
    protected _preMiddleware: Middleware = t => t,
    protected _postMiddleware: Middleware = t => t
  ) { }

  protected _init() {
    this._dispatcher.dispatch({ type: ActionTypes.INIT });
  }

  connect(nextCallbackFn: (state: any) => void) {
    this._dispatcher
      .let(this._preMiddleware)
      .scan((state, action) => this._reducer(state, action), this._initialState)
      .let(this._postMiddleware)
      .subscribe(nextCallbackFn);

    this._init();
  }

  replaceReducer(reducer: Reducer<any>) {
    this._reducer = reducer;

    this._init();
  }
}
