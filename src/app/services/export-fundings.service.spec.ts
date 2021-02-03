/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ExportFundingsService } from './export-fundings.service';

describe('Service: ExportFundings', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExportFundingsService]
    });
  });

  it('should ...', inject([ExportFundingsService], (service: ExportFundingsService) => {
    expect(service).toBeTruthy();
  }));
});
