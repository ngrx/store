import {provide, OpaqueToken, Provider, Injector} from 'angular2/core';

import {Reducer, Middleware} from './interfaces';
import {Dispatcher} from './dispatcher';
import {Store} from './store';
import {StoreBackend, ActionTypes} from './store-backend';
import {compose, combineReducers} from './utils';

export const PRE_MIDDLEWARE = new OpaqueToken('ngrx/store/pre-middleware');
export const POST_MIDDLEWARE = new OpaqueToken('ngrx/store/post-middleware');
export const RESOLVED_PRE_MIDDLEWARE = new OpaqueToken('ngrx/store/resolved-pre-middleware');
export const RESOLVED_POST_MIDDLEWARE = new OpaqueToken('ngrx/store/resolved-post-middleware');
export const REDUCER = new OpaqueToken('ngrx/store/reducer');
export const INITIAL_STATE = new OpaqueToken('ngrx/store/initial-state');

const dispatcherProvider = provide(Dispatcher, {
  useFactory() {
    return new Dispatcher<any>();
  }
});

const storeProvider = provide(Store, {
  deps: [Dispatcher, StoreBackend, INITIAL_STATE],
  useFactory(dispatcher: Dispatcher<any>, backend: StoreBackend, initialState: any) {
      return new Store<any>(dispatcher, backend, initialState);
  }
});

const storeBackendProvider = provide(StoreBackend, {
  deps: [Dispatcher, REDUCER, INITIAL_STATE, RESOLVED_PRE_MIDDLEWARE, RESOLVED_POST_MIDDLEWARE],
  useFactory(
    dispatcher: Dispatcher<any>,
    reducer: Reducer<any>,
    initialState: any,
    preMiddleware: Middleware,
    postMiddleware: Middleware
  ) {
    return new StoreBackend(dispatcher, reducer, initialState, preMiddleware, postMiddleware);
  }
});

const resolvedPreMiddlewareProvider = provide(RESOLVED_PRE_MIDDLEWARE, {
  deps: [PRE_MIDDLEWARE],
  useFactory(middleware: Middleware[]) {
    return compose(...middleware);
  }
});

const resolvedPostMiddlewareProvider = provide(RESOLVED_POST_MIDDLEWARE, {
  deps: [POST_MIDDLEWARE],
  useFactory(middleware: Middleware[]) {
    return compose(...middleware);
  }
});

export function provideStore(reducer: any, initialState?: any) {
  return [
    provide(REDUCER, {
      useFactory() {
        if (typeof reducer === 'function') {
          return reducer;
        }

        return combineReducers(reducer);
      }
    }),
    provide(INITIAL_STATE, {
      deps: [ REDUCER ],
      useFactory(reducer) {
        if (initialState === undefined) {
          return reducer(undefined, { type: ActionTypes.INIT });
        }

        return initialState;
      }
    }),
    provide(PRE_MIDDLEWARE, { multi: true, useValue: (T => T) }),
    provide(POST_MIDDLEWARE, { multi: true, useValue: (T => T) }),
    dispatcherProvider,
    storeProvider,
    storeBackendProvider,
    resolvedPreMiddlewareProvider,
    resolvedPostMiddlewareProvider
  ];
}

export function usePreMiddleware(...middleware: Array<Middleware | Provider>) {
  return provideMiddlewareForToken(PRE_MIDDLEWARE, middleware);
}

export function usePostMiddleware(...middleware: Array<Middleware | Provider>) {
  return provideMiddlewareForToken(POST_MIDDLEWARE, middleware);
}

export function createMiddleware(
  useFactory: (...deps: any[]) => Middleware, deps?: any[]
): Provider {
  return provide(new OpaqueToken('@ngrx/store middleware'), {
    deps,
    useFactory
  });
}

export function provideMiddlewareForToken(token, _middleware: any[]): Provider[] {
  function isProvider(t: any): t is Provider {
    return t instanceof Provider;
  }

  const provider = provide(token, {
    multi: true,
    deps: [ Injector ],
    useFactory(injector: Injector) {
      const middleware = _middleware.map(m => {
        if (isProvider(m)) {
          return injector.get(m.token);
        }

        return m;
      });

      return compose(...middleware);
    }
  });

  return [ ..._middleware.filter(isProvider), provider ];
}
