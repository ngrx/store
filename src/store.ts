import { select, SelectSignature } from '@ngrx/core';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Operator } from 'rxjs/Operator';

import { Action } from './dispatcher';
import { State } from './state';
import { ActionReducer } from './reducer';


export class Store<T> extends Observable<T> implements Observer<Action> {
  constructor(
    private _dispatcher: Observer<Action>,
    private _reducer: Observer<ActionReducer<any>>,
    state$: Observable<any>
  ) {
    super();

    this.source = state$;
  }

  select: SelectSignature<T> = select.bind(this);

  lift<R>(operator: Operator<T, R>): Store<R> {
    const store = new Store<R>(this._dispatcher, this._reducer, this);
    store.operator = operator;
    return store;
  }

  replaceReducer(reducer: ActionReducer<any>) {
    this._reducer.next(reducer);
  }

  dispatch(action: Action) {
    this._dispatcher.next(action);
  }

  next(action: Action) {
    this._dispatcher.next(action);
  }

  error(err: any) {
    this._dispatcher.error(err);
  }

  complete() {
    // noop
  }
}
