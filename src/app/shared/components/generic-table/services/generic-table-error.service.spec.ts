import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { GenericTableErrorService } from './generic-table-error.service';

describe('GenericTableErrorService', () => {
  let service: GenericTableErrorService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule
      ]});
    service = TestBed.inject(GenericTableErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
