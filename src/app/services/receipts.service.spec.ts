import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReceiptsService } from './receipts.service';

describe('ReceiptsService', () => {
  let service: ReceiptsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(ReceiptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
