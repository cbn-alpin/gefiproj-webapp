import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { GenericTableTypeService } from './generic-table-type.service';

describe('GenericTableTypeService', () => {
  let service: GenericTableTypeService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule
    ]});
    service = TestBed.inject(GenericTableTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
