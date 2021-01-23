import { TestBed } from '@angular/core/testing';

import { GenericTableTypeService } from './generic-table-type.service';

describe('GenericTableTypeService', () => {
  let service: GenericTableTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericTableTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
