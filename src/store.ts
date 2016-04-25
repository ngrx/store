import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Observer} from 'rxjs/Observer';

import {State} from './state';
import {Dispatcher, Action} from './dispatcher';
import {Reducer, ActionReducer} from './reducer';

export class Store<T> extends BehaviorSubject<T> implements Observer<Action> {
  constructor(
    private _dispatcher$: Dispatcher,
    private _reducer$: Reducer,
    state$: State<T>
  ) {
    super(state$.value);

    state$.subscribe(state => super.next(state));
  }

  dispatch(action: Action) {
    this._dispatcher$.dispatch(action);
  }

  next(action: any) {
    this._dispatcher$.next(action);
  }

  error(error?: any) {
    this._dispatcher$.error(error);
  }

  replaceReducer<V>(reducer: ActionReducer<V>) {
    this._reducer$.replace(reducer);
  }
}
