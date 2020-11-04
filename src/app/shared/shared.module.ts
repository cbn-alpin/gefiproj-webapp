import { NgModule } from '@angular/core';
import { GenericTableModule } from './components/generic-table/generic-table.module';
import { DirectivesModule } from './directives/directives.module';



@NgModule({
  declarations: [
  ],
  exports: [
    GenericTableModule,
    DirectivesModule
  ]
})
export class SharedModule { }
