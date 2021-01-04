import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { FinancementsService } from './financements.service';

describe('FinancementsService', () => {
  let service: FinancementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(FinancementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
