import { MatSortModule } from '@angular/material/sort';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DirectivesModule } from './directives/directives.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { GenericDialogComponent } from './components/generic-dialog/generic-dialog.component';
import { GenericTableComponent } from './components/generic-table/components/generic-table/generic-table.component';

@NgModule({
  declarations: [
    GenericTableComponent,
    GenericDialogComponent
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
    MatFormFieldModule,
    MatDialogModule
  ],
  exports: [
    GenericTableComponent,
    DirectivesModule,
    GenericDialogComponent
  ],
  providers: [
    MatDatepickerModule,
    GenericDialogComponent
  ]
})
export class SharedModule { }
