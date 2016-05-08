import { withLatestFrom } from 'rxjs/operator/withLatestFrom';
import { scan } from 'rxjs/operator/scan';
import { observeOn } from 'rxjs/operator/observeOn';
import { queue } from 'rxjs/scheduler/queue';
import { SyncSubject } from '@ngrx/core/SyncSubject';

import { Dispatcher } from './dispatcher';
import { Reducer } from './reducer';

export class State<T> extends SyncSubject<T> {
  constructor(_initialState: T, action$: Dispatcher, reducer$: Reducer) {
    super(_initialState);

    const actionInQueue$ = observeOn.call(action$, queue);
    const actionAndReducer$ = withLatestFrom.call(actionInQueue$, reducer$);
    const state$ = scan.call(actionAndReducer$, (state, [ action, reducer ]) => {
      return reducer(state, action);
    }, _initialState);

    state$.subscribe(value => this.next(value));
  }
}
