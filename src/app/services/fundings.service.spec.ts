import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FundingsService } from './fundings.service';

describe('FinancementsService', () => {
  let service: FundingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(FundingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
