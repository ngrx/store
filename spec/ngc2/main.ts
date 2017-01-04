import { NgModule, Component } from '@angular/core';
import { platformDynamicServer } from '@angular/platform-server';
import { BrowserModule } from '@angular/platform-browser';
import { Store, StoreModule } from '../../';
import { counterReducer, INCREMENT, DECREMENT } from '../fixtures/counter';
import { Observable } from 'rxjs/Observable';

export interface AppState {
  count: number;
}

export const storeConfig = {count: counterReducer};
export function initialState() {
  return { count : 0 };
}

@Component({
  selector: 'ngc-spec-component',
  template: `
    <button (click)="increment()"> + </button>
    <span>  Count : {{ count | async }}  </span>
    <button (click)="decrement()"> + </button>
  `
})
export class NgcSpecComponent {
  count: Observable<number>;
  constructor(public store:Store<AppState>){
    this.count = store.select(state => state.count);
  }
  increment(){
    this.store.dispatch({ type: INCREMENT });
  }
  decrement(){
    this.store.dispatch({ type: DECREMENT });
  }
}

@NgModule({
  imports: [
    BrowserModule,
    StoreModule.provideStore(storeConfig, initialState)
  ],
  declarations: [NgcSpecComponent],
  bootstrap: [NgcSpecComponent]
})
export class NgcSpecModule {}
