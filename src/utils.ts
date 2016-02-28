import {Reducer} from './interfaces';

export const combineReducers = (reducers:any): Reducer<any> => {

  const reducerKeys = Object.keys(reducers);

  return (state = {}, action) => {

    let hasChanged = false;
    const nextState = {};
    for (var i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      const reducer = reducers[key];
      const previousState = state[key];
      const newState = reducer(previousState, action);
      nextState[key] = newState;
      hasChanged = hasChanged || previousState !== newState;
    }
    return hasChanged ? nextState : state;
  }
}


export const compose = (...funcs) => {
  return (...args) => {
    if (funcs.length === 0) {
      return args[0]
    }

    const last = funcs[funcs.length - 1]
    const rest = funcs.slice(0, -1)

    return rest.reduceRight((composed, f) => f(composed), last(...args))
  }
}
