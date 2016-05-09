import {Subject} from 'rxjs/Subject';

export class Dispatcher<T> extends Subject<T> {
  dispatch(action: T): void {
    this.next(action);
  }
}
