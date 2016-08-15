import { NgModule, Component } from '@angular/core'
import { platformDynamicServer } from '@angular/platform-server'
import { BrowserModule } from '@angular/platform-browser'
import { provideStore, Store } from '../dist/index'

@Component({
  selector: 'ngc-spec-component',
  template: `
    <button (click)="increment()"> + </button>
    <span>  Count : {{count | async }}  </span>
    <button (click)="decrement()"> + </button>
  `
})
export class NgcSpecComponent {
  constructor(store:Store<any>){
    console.log(store)
  }
}

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [NgcSpecComponent],
  bootstrap: [NgcSpecComponent],
  providers: [provideStore({},{})]
})
export class NgcSpecModule {}
