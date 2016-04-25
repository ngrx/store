import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {scan} from 'rxjs/operator/scan';
import {withLatestFrom} from 'rxjs/operator/withLatestFrom';

import {Action, Dispatcher} from './dispatcher';
import {Reducer} from './reducer';

export class State<T> extends BehaviorSubject<T> {
  constructor(reducer$: Reducer, action$: Dispatcher, INITIAL_STATE: T) {
    super(INITIAL_STATE);

    const actionAndReducer$ = withLatestFrom.call(action$, reducer$);
    const scan$ = scan.call(actionAndReducer$, (state, [ action, reducer ]) => {
      return reducer(state, action);
    }, INITIAL_STATE);

    scan$.subscribe(this);
  }
}
