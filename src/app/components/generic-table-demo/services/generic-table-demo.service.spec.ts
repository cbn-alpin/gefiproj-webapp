import { TestBed } from '@angular/core/testing';

import { GenericTableDemoService } from './generic-table-demo.service';

describe('GenericTableDemoService', () => {
  let service: GenericTableDemoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericTableDemoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
