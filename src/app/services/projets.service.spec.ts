/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProjetsService } from './projets.service';

describe('Service: Projets', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjetsService]
    });
  });

  it('should ...', inject([ProjetsService], (service: ProjetsService) => {
    expect(service).toBeTruthy();
  }));
});
