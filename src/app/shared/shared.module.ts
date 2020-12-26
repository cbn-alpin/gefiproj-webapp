import { NgModule } from '@angular/core';
import { GenericDialogComponent } from './components/generic-dialog/generic-dialog.component';
import { GenericTableModule } from './components/generic-table/generic-table.module';
import { DirectivesModule } from './directives/directives.module';



@NgModule({
  declarations: [
  ],
  exports: [
    GenericTableModule,
    DirectivesModule
  ],
  providers: [
    GenericDialogComponent
  ]
})
export class SharedModule { }
