import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject';
import {Observable} from 'rxjs/Observable';

export interface Action {
  type: string;
  payload?: any;
}

export class Dispatcher extends BehaviorSubject<Action> {
  static INIT = '@@ngrx/INIT';

  constructor() {
    super({ type: Dispatcher.INIT });
  }

  dispatch(action: Action): void {
    this.next(action);
  }
}
