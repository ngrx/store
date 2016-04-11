import {ReplaySubject} from 'rxjs/subject/ReplaySubject';
import {Observable} from 'rxjs/Observable';

import {Action} from './interfaces';

export class Dispatcher<T> extends ReplaySubject<T> {
  constructor() {
    super(1);
  }

  dispatch(action: T): void {
    this.next(action);
  }
}
