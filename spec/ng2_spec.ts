declare var describe, it, expect, hot, cold, expectObservable, expectSubscriptions, console, beforeEach;
require('es6-shim');
import 'reflect-metadata';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {ReflectiveInjector, provide, OpaqueToken} from '@angular/core';

import {
  StoreBackend,
  usePreMiddleware,
  usePostMiddleware,
  RESOLVED_PRE_MIDDLEWARE,
  provideStore,
  createMiddleware
} from '../src';


describe('ngRx Angular 2 Bindings', () => {

  describe('Middleware', () => {
    it('should allow you to compose middleware using providers', () => {
      const first = { apply: t => t };
      const second = { apply: t => t };
      const third = { apply: t => t };

      spyOn(first, 'apply');
      spyOn(second, 'apply');
      spyOn(third, 'apply');

      const secondProvider = provide(new OpaqueToken('Second Midleware'), { useValue: second.apply });
      const thirdProvider = createMiddleware(() => third.apply);
      const injector = ReflectiveInjector.resolveAndCreate([
        provideStore((_, a) => a),
        usePreMiddleware(first.apply, secondProvider, thirdProvider)
      ]);

      const preMiddleware = injector.get(RESOLVED_PRE_MIDDLEWARE);
      preMiddleware();

      expect(first.apply).toHaveBeenCalled();
      expect(second.apply).toHaveBeenCalled();
      expect(third.apply).toHaveBeenCalled();
    });
  });

});
