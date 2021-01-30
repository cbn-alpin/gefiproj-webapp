import { TestBed } from '@angular/core/testing';

import { RecettesService } from './recettes.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('RecettesService', () => {
  let service: RecettesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(RecettesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
