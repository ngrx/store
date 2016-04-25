import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Action, Dispatcher} from './dispatcher';

export interface ActionReducer<T> {
  (state: T, action: Action): T;
}

export class Reducer extends BehaviorSubject<ActionReducer<any>> {
  static REPLACE = '@@ngrx/replace-reducer';

  constructor(initialReducer: ActionReducer<any>, private _dispatcher: Dispatcher) {
    super(initialReducer);
  }

  replace(reducer: ActionReducer<any>) {
    this.next(reducer);
    this._dispatcher.dispatch({ type: Reducer.REPLACE });
  }
}
