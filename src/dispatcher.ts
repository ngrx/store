import { SyncSubject } from '@ngrx/core/SyncSubject';
import {Observable} from 'rxjs/Observable';

export interface Action {
  type: string;
  payload?: any;
}

export class Dispatcher extends SyncSubject<Action> {
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
