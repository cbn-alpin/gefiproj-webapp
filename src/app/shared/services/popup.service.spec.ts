import { TestBed } from '@angular/core/testing';

import { PopupService } from './popup.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('PopupService', () => {
  let service: PopupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
    });
    service = TestBed.inject(PopupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
