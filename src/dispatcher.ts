import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {Action} from './interfaces';

export class Dispatcher<T> extends Subject<T> {
  dispatch(action: T): void {
    this.next(action);
  }
}
