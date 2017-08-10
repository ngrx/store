import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface Action {
  type: string;
  payload?: any;
}

export interface TypedAction<T> extends Action {
  payload: T;
}

export class Dispatcher extends BehaviorSubject<Action> {
  static INIT = '@ngrx/store/init';

  constructor() {
    super({ type: Dispatcher.INIT });
  }

  dispatch(action: Action): void {
    this.next(action);
  }

  complete() {
    // noop
  }
}
