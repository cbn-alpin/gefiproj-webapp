/* tslint:disable:no-unused-variable */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, async, inject } from '@angular/core/testing';
import { ProjetsService } from './projets.service';

describe('Service: Projets', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [ProjetsService]
    });
  });

  it('should ...', inject([ProjetsService], (service: ProjetsService) => {
    expect(service).toBeTruthy();
  }));
});
