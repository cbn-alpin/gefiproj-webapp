/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ExpensesService } from './expenses.service';

describe('Service: Expenses', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpensesService]
    });
  });

  it('should ...', inject([ExpensesService], (service: ExpensesService) => {
    expect(service).toBeTruthy();
  }));
});
