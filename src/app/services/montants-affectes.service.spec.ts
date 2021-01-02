import { TestBed } from '@angular/core/testing';

import { MontantsAffectesService } from './montants-affectes.service';

describe('MontantsAffectesService', () => {
  let service: MontantsAffectesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MontantsAffectesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
