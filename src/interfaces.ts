import {Observable} from 'rxjs/Observable';

export interface Action {
  type: string;
  payload?: any;
}

export interface Reducer<T> {
  (state: T, action: Action): T;
}

export interface Middleware {
  (observable: Observable<any>): Observable<any>;
}
