/* tslint:disable:no-unused-variable */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../components/connexion/connexion.component';
import { HomeComponent } from '../components/home/home.component';
import { ExpensesService } from './expenses.service';

describe('Service: Expenses', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        )
      ],
      providers: [ExpensesService]
    });
  });

  it('should ...', inject([ExpensesService], (service: ExpensesService) => {
    expect(service).toBeTruthy();
  }));
});
