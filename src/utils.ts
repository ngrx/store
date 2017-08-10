import {ActionReducer} from './reducer';
import {TypedAction} from './dispatcher';

export function combineReducers(reducers: any): ActionReducer<any> {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  const finalReducerKeys = Object.keys(finalReducers);

  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}

export type SwitchReduceRun<P, S> = (payload: P, action?: TypedAction<P>, state?: S) => S;

export class SwitchReduceBuilder<S> {
  private newState: S;

  constructor(private state: S, private action: TypedAction<any>) {
    this.newState = state;
  }

  byClass<P>(actionConstructor: {new(P): TypedAction<P>; }, run: SwitchReduceRun<P, S>): SwitchReduceBuilder<S> {
    if (this.newState === this.state && this.action instanceof actionConstructor) {
      this.newState = run(this.action.payload, this.action, this.state);
    }
    return this;
  }

  byClasses(actionConstructors: {new(a: any): TypedAction<any>; }[], run: SwitchReduceRun<any, S>): SwitchReduceBuilder<S> {
    actionConstructors.forEach((actionConstructor) =>
      this.byClass(actionConstructor, run));
    return this;
  }

  byType(type: string, run: SwitchReduceRun<any, S>): SwitchReduceBuilder<S> {
    if (this.newState === this.state && type === this.action.type) {
      this.newState = run(this.action.payload, this.action, this.state);
    }
    return this;
  }

  byTypes(types: string[], run: SwitchReduceRun<any, S>): SwitchReduceBuilder<S> {
    types.forEach((type) =>
      this.byType(type, run));
    return this;
  }

  reduce(defaultRun?: SwitchReduceRun<any, S>): S {
    if (defaultRun instanceof Function && this.newState === this.state) {
      this.newState = defaultRun(this.action.payload, null, this.state);
    }
    return this.newState;
  }
}

export function switchReduce<S>(state: S, action: TypedAction<any>): SwitchReduceBuilder<S> {
  return new SwitchReduceBuilder(state, action);
}
