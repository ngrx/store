import {Store} from './store';

export interface Action {
  type: string;
  payload?: any;
}

export interface Reducer<T> {
  (state: T, action: Action): T;
}

export interface StoreCreator {
  (reducer: Reducer<any>, initialState: {[key:string]: any}): Store<any>
}

export interface StoreEnhancer {
  (next: StoreCreator): StoreCreator;
}
