import { NgModule } from '@angular/core';
import { NumericDirective } from './numeric-directive';
import { NegativeNumericDirective } from './negative-numeric.directive';



@NgModule({
  declarations: [
    NumericDirective,
    NegativeNumericDirective
  ],
  exports: [
    NumericDirective,
    NegativeNumericDirective
  ],
})
export class DirectivesModule { }
