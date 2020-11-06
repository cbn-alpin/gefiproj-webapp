import { TestBed } from '@angular/core/testing';

import { FinancementsService } from './financements.service';

describe('FinancementsService', () => {
  let service: FinancementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
