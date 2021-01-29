import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { SuiviFinancementsService } from './suivi-financements.service';
import { ConnexionComponent } from '../components/connexion/connexion.component';
import { HomeComponent } from '../components/home/home.component';

describe('SuiviFinancementsService', () => {
  let service: SuiviFinancementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        )
      ]
    });
    service = TestBed.inject(SuiviFinancementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
