import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { GenericTableService } from './generic-table.service';

describe('GenericTableService', () => {
  let service: GenericTableService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule
      ]
    });
    service = TestBed.inject(GenericTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
