import { MatSortModule } from '@angular/material/sort';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GenericTableComponent} from './components/generic-table/generic-table.component';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { DirectivesModule } from '../../directives/directives.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    GenericTableComponent
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    DirectivesModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatIconModule,
    MatFormFieldModule  
  ],
  exports: [
    GenericTableComponent
  ],
  providers: [
    MatDatepickerModule
  ]
})
export class GenericTableModule { }
