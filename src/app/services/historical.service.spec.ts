/* tslint:disable:no-unused-variable */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../components/connexion/connexion.component';
import { HomeComponent } from '../components/home/home.component';
import { HistoricalService } from './historical.service';

describe('Service: Historical', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        )
      ],
      providers: [HistoricalService]
    });
  });

  it('should ...', inject([HistoricalService], (service: HistoricalService) => {
    expect(service).toBeTruthy();
  }));
});
