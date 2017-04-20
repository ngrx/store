import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Dispatcher, Action } from './dispatcher';

export interface ActionReducer<T> {
  (state: T, action: Action): T;
}

export class Reducer extends BehaviorSubject<ActionReducer<any>> {
  static REPLACE = '@ngrx/store/replace-reducer';

  constructor(private _dispatcher: Dispatcher, initialReducer: ActionReducer<any>) {
    super(initialReducer);
  }

  replaceReducer(reducer: ActionReducer<any>) {
    this.next(reducer);
  }

  next(reducer: ActionReducer<any>) {
    super.next(reducer);
    this._dispatcher.dispatch({ type: Reducer.REPLACE });
  }
}
