import { TestBed } from '@angular/core/testing';

import { EntreesSortiesService } from './entrees-sorties.service';

describe('EntreesSortiesService', () => {
  let service: EntreesSortiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntreesSortiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
