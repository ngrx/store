import { select, SelectSignature } from '@ngrx/core/operator/select';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

import { Action } from './dispatcher';
import { State } from './state';
import { ActionReducer } from './reducer';


export class Store<T> extends Observable<T> implements Observer<Action> {
  constructor(
    private _dispatcher: Observer<Action>,
    private _reducer: Observer<ActionReducer<any>>,
    state$: Observable<T>
  ) {
    super(subscriber => {
      const subscription = state$.subscribe(subscriber);

      return () => subscription.unsubscribe();
    });
  }

  select: SelectSignature<T> = select.bind(this);

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
