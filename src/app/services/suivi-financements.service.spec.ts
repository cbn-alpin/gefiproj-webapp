import { TestBed } from '@angular/core/testing';

import { SuiviFinancementsService } from './suivi-financements.service';

describe('SuiviFinancementsService', () => {
  let service: SuiviFinancementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuiviFinancementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
