/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ExportReceiptsService } from './export-receipts.service';

describe('Service: ExportReceipts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExportReceiptsService]
    });
  });

  it('should ...', inject([ExportReceiptsService], (service: ExportReceiptsService) => {
    expect(service).toBeTruthy();
  }));
});
