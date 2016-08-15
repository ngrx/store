# @ngrx/store

[![Join the chat at https://gitter.im/ngrx/store](https://badges.gitter.im/ngrx/store.svg)](https://gitter.im/ngrx/store?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![CircleCI Status for ngrx/store](https://circleci.com/gh/ngrx/store.svg?style=shield&circle-token=aea1fc73de3419cd926fc95e627e036113646fd8
)](https://circleci.com/gh/ngrx/store)
[![npm version](https://badge.fury.io/js/%40ngrx%2Fstore.svg)](https://badge.fury.io/js/%40ngrx%2Fstore)

RxJS powered state management inspired by Redux for Angular 2 apps

### Demo

http://plnkr.co/edit/Hb4pJP3jGtOp6b7JubzS?p=preview

### Example Application

https://github.com/ngrx/example-app

### Introduction
- [Comprehensive Introduction to @ngrx/store](https://gist.github.com/btroncone/a6e4347326749f938510)
- [Reactive Angular 2 with ngrx (video)](https://youtu.be/mhA7zZ23Odw)
- [@ngrx/store in 10 minutes (video)](https://egghead.io/lessons/angular-2-ngrx-store-in-10-minutes)

### Installation
Make sure you have  @angular/core and @ngrx/core installed via npm:
```bash
npm install @angular/core @ngrx/core --save
```

Install @ngrx/store from npm:
```bash
npm install @ngrx/store --save
```

Set up with Angular-CLI and SystemJS.
Modify system-config.ts:
```ts
    /** Map relative paths to URLs. */
    const map: any = {
        '@ngrx': 'vendor/@ngrx'
    };
    
    /** User packages configuration. */
    const packages: any = {
        '@ngrx/core': {
            main: 'index.js',
            format: 'cjs'
        },
        '@ngrx/store': {
            main: 'index.js',
            format: 'cjs'
        }
    };
```
Modify angular-cli-build.js by adding this line to vendorNpmFiles:
```js
    '@ngrx/**/*.+(js|js.map)'
```

### Usage

Create a reducer function for each data type you have in your application. The combination of these reducers will make up your application state:

```ts
// counter.ts
import { ActionReducer, Action } from '@ngrx/store';

export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const RESET = 'RESET';

export const counterReducer: ActionReducer<number> = (state: number = 0, action: Action) => {
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

In your app's main module, import those reducers and use the `StoreModule.provideStore(reducers, initialState)` function to provide them to Angular's injector:

```ts
import { Store, StoreModule } from '@ngrx/store';
import { counterReducer } from './counter';
import { NgModule } from '@angular/core'

@NgModule({
  imports: [
    BrowserModule,
    StoreModule.provideStore({ counter: counterReducer }, { counter: 0 })
  ]
})
export class MyAppModule {}

```

You can then inject the `Store` service into your components and services. The `store.select` method can be used to obtain the appropriate slice(s) of state from your application store:

```ts
import { Store } from '@ngrx/store';
import { INCREMENT, DECREMENT, RESET } from './counter';

interface AppState {
  counter: number;
}

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

	constructor(public store: Store<AppState>){
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

### Migrating from Store v1.x

#### Middleware
The middleware APIs have been removed. There are no plans to reintroduce these APIs and there is not a straightforward upgrade process if you rely on middleware.

Some popular middleware libraries have already been upgraded. If you were using [store-saga](https://github.com/CodeSequence/store-saga), checkout [@ngrx/effects](https://github.com/ngrx/effects). If you were using [ngrx-store-logger](https://github.com/btroncone/ngrx-store-logger), it has been reimplemented as a [meta reducer](https://gist.github.com/btroncone/a6e4347326749f938510#implementing-a-meta-reducer).

#### getState(), getValue(), and value
The APIs for synchronously pulling the most recent state value out of Store have been removed. Instead, you can _always_ rely on `subscribe()` running synchronously if you _have_ to get the state value:

```ts
import 'rxjs/add/operator/take';

function getState(store: Store<State>): State {
	let state: State;

	store.take(1).subscribe(s => state = s);

	return state;
}
```

## Contributing

Please read [contributing guidelines here](https://github.com/ngrx/store/blob/master/CONTRIBUTING.md).
