import { TestBed } from '@angular/core/testing';

import { FinanceurService } from './financeur.service';

describe('FinanceurService', () => {
  let service: FinanceurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinanceurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
