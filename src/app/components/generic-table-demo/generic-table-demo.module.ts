import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {GenericTableDemoComponent} from './containers/generic-table-demo/generic-table-demo.component';
import {FamilleTableComponent} from './components/famille-table/famille-table.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';



@NgModule({
  exports: [
    GenericTableDemoComponent,
    FamilleTableComponent
  ],
  declarations: [
    GenericTableDemoComponent,
    FamilleTableComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BrowserAnimationsModule
  ]
})
export class GenericTableDemoModule { }
