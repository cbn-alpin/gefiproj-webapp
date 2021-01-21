import { TestBed } from '@angular/core/testing';

import { GenericTableErrorService } from './generic-table-error.service';

describe('GenericTableErrorService', () => {
  let service: GenericTableErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericTableErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
