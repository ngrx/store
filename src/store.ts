import { SyncSubject } from '@ngrx/core/SyncSubject';
import { select, SelectSignature } from '@ngrx/core/operator/select';

import { Dispatcher, Action } from './dispatcher';
import { State } from './state';
import { Reducer, ActionReducer } from './reducer';


export class Store<T> extends SyncSubject<T> {
  constructor(
    private _dispatcher: Dispatcher,
    private _reducer: Reducer,
    state$: State<T>,
    initialState: T
  ) {
    super(initialState);

    state$.subscribe(state => super.next(state));
  }

  select: SelectSignature<T> = select.bind(this);

  replaceReducer(reducer: ActionReducer<any>) {
    this._reducer.replaceReducer(reducer);
  }

  dispatch(action: Action) {
    this._dispatcher.dispatch(action);
  }

  next(action: any) {
    this._dispatcher.dispatch(action);
  }

  error(err: any) {
    this._dispatcher.error(err);
  }

  complete() {
    // noop
  }
}