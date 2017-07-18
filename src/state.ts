import { withLatestFrom } from 'rxjs/operator/withLatestFrom';
import { scan } from 'rxjs/operator/scan';
import { observeOn } from 'rxjs/operator/observeOn';
import { queue } from 'rxjs/scheduler/queue';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Dispatcher } from './dispatcher';
import { Reducer } from './reducer';

export class State<T> extends BehaviorSubject<T> {
  constructor(_initialState: T, action$: Dispatcher, reducer$: Reducer) {
    super(_initialState);

    const actionInQueue$ = observeOn.call(action$, queue);
    const actionAndReducer$ = withLatestFrom.call(actionInQueue$, reducer$);
    const state$ = scan.call(actionAndReducer$, (state: any, [ action, reducer ]: [any, any]) => {
      return reducer(state, action);
    }, _initialState);

    state$.subscribe((value: any) => this.next(value));
  }
}
