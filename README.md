# @ngrx/store

[![Join the chat at https://gitter.im/ngrx/store](https://badges.gitter.im/ngrx/store.svg)](https://gitter.im/ngrx/store?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[ ![Codeship Status for ngrx/store](https://img.shields.io/codeship/0c4f5b50-8372-0133-b304-425351b234ba/master.svg)](https://codeship.com/projects/121789)
[![npm version](https://badge.fury.io/js/%40ngrx%2Fstore.svg)](https://badge.fury.io/js/%40ngrx%2Fstore)

RxJS powered state management inspired by Redux for Angular2 apps

### Demo

http://plnkr.co/edit/Hb4pJP3jGtOp6b7JubzS?p=preview

### installation
- Make sure you have angular2 installed via npm : `npm install angular2`
- Install from npm : `npm install @ngrx/store`

### usage

- Create a reducer function for each data type you have:

```typescript
//counter.ts
import {Reducer, Action} from '@ngrx/store';

export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const RESET = 'RESET';

export const counter:Reducer<number> = (state:number = 0, action:Action) => {

	switch (action.type) {
		case INCREMENT:
			return state + 1;

		case DECREMENT:
			return state - 1;

		case RESET:
			return 0;

		default:
			return state;
	}
}
```

- In your app's main module, import those reducers and use the `provideStore(reducers, initialState)` function to provide them to Angular's injector:

```typescript

import {bootstrap} from 'angular2/platform/bootstrap';
import {provideStore} from '@ngrx/store';
import {App} from './myapp';

import {counter} from './counter';

bootstrap(App, [ provideStore({counter}, {counter: 0}) ]);

```

- You can then inject the `Store` service into your Components and Services:

```typescript
import {Store} from '@ngrx/store';
import {INCREMENT, DECREMENT, RESET} from './counter';

@Component({
	selector: 'my-app',
	template: `
	  <button (click)="increment()">Increment</button>
		<div>Current Count: {{ counter | async }}</div>
		<button (click)="decrement()">Decrement</button>
	`
})
class MyApp {
	counter: Observable<number>;
	constructor(public store: Store<number>){
		this.counter = store.select('counter');
	}
	increment(){
		this.store.dispatch({ type: INCREMENT });
	}
	decrement(){
		this.store.dispatch({ type: DECREMENT });
	}
	reset(){
		this.store.dispatch({ type: RESET });
	}
}

```

###Middleware
####`(observable: Observable<any>): Observable<any>`
Store middleware provides pre and post reducer entry points for all dispatched actions. Middleware can be used for everything from logging, asynchronous event handling, to action or post action manipulation. 

#####Dispatched action pipeline:
1. Pre-Middleware : `(observable: Observable<Action>): Observable<Action>`
2. Reducer
3. Post-Middleware : `(observable: Observable<State>): Observable<State>`

Middleware can be configured during application bootstrap by utilizing the `usePreMiddleware(...middleware: Middleware[])` and `usePostMiddleware(...middleware: Middleware[])` helper functions. 

```typescript
import {bootstrap} from 'angular2/platform/browser';
import {App} from './myapp';
import {provideStore, usePreMiddleware, usePostMiddleware, Middleware} from "@ngrx/store";
import {counter} from "./counter";

const actionLog : Middleware = action => {
    return action.do(val => {
        console.warn('DISPATCHED ACTION: ', val)
    });
};

const stateLog : Middleware = state => {
    return state.do(val => {
        console.info('NEW STATE: ', val)
    });
};

bootstrap(App, [
  provideStore({counter},{counter : 0}),
  usePreMiddleware(actionLog),
  usePostMiddleware(stateLog)
]);
```
For a more complex example check out [store-saga](https://github.com/MikeRyan52/store-saga), an ngrx store middleware implementation inspired by [redux saga](https://github.com/yelouafi/redux-saga).

## Contributing

Please read [contributing guidelines here](https://github.com/ngrx/store/blob/master/CONTRIBUTING.md).





