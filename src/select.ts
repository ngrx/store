import {Observable} from 'rxjs/Observable';
import {pluck} from 'rxjs/operator/pluck';
import {distinctUntilChanged} from 'rxjs/operator/distinctUntilChanged';
import {map} from 'rxjs/operator/map';

export interface Select<T> {
  (...paths: string[]): any;
  <U>(mapFn: (input: T) => U): Observable<U>;
}

Observable.prototype.select = function(pathOrMapFn: any, ...paths: string[]) {
  let mapped: Observable<any>;

  if (typeof pathOrMapFn === 'string') {
    mapped = pluck.call(this, pathOrMapFn, ...paths);
  }
  else if (typeof pathOrMapFn === 'function') {
    mapped = map.call(this, pathOrMapFn);
  }
  else {
    throw new TypeError(
      `Store@select Unknown Parameter Type: `
      + `Expected type of function or valid key type, got ${typeof pathOrMapFn}`
    );
  }

  return distinctUntilChanged.call(mapped);
};

declare module 'rxjs/Observable' {
  interface Observable<T> {
    select: Select<T>;
  }
}
