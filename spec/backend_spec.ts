declare var describe, it, expect, hot, cold, expectObservable, expectSubscriptions, console, beforeEach;
require('es6-shim');
import 'reflect-metadata';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {ReflectiveInjector, provide} from '@angular/core';

import {Dispatcher, StoreBackend, Action, usePreMiddleware, usePostMiddleware, provideStore} from '../src/index';
import {ActionTypes} from '../src/store-backend';


describe('ngRx Store Backend', () => {
  const Reducer = { reduce: t => t };
  const Middleware = { pre: t => t, post: t => t };
  const initialState = 123;
  let injector: ReflectiveInjector;
  let backend: StoreBackend;
  let dispatcher: Dispatcher<Action>;

  beforeEach(() => {
    spyOn(Reducer, 'reduce').and.callThrough();
    spyOn(Middleware, 'pre').and.callThrough();
    spyOn(Middleware, 'post').and.callThrough();

    injector = ReflectiveInjector.resolveAndCreate([
      provideStore(Reducer.reduce, initialState),
      usePreMiddleware(Middleware.pre),
      usePostMiddleware(Middleware.post)
    ]);

    backend = injector.get(StoreBackend);
    dispatcher = injector.get(Dispatcher);
  });

  it('should initialize the dispatcher after a connection is made', function() {

    let action;

    dispatcher.subscribe(a => {
      action = a;
    });

    backend.connect(() => {});

    expect(action).toEqual({ type: ActionTypes.INIT });

  });

  it('should call the reducer to scan over the dispatcher', function() {

    const target = new Subject();
    backend.connect(() => {});

    expect(Reducer.reduce).toHaveBeenCalledWith(initialState, { type: ActionTypes.INIT });

  });

  it('should apply the middleware to the dispatcher', function() {

    backend.connect(() => {});

    expect(Middleware.pre).toHaveBeenCalledWith(dispatcher);
    expect(Middleware.post).toHaveBeenCalled();

  });

  it('should replace the reducer for existing existing connections', function() {

    const NewReducer = { reduce: () => 234 };
    spyOn(NewReducer, 'reduce').and.callThrough();
    let lastValue: any;
    backend.connect(t => lastValue = t);
    backend.replaceReducer(NewReducer.reduce);

    expect(NewReducer.reduce).toHaveBeenCalledWith(initialState, { type: ActionTypes.INIT });
    expect(lastValue).toEqual(234);

  });

});
