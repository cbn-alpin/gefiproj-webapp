import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../components/connexion/connexion.component';
import { HomeComponent } from '../components/home/home.component';
import { ProjetService } from './projet.service';

describe('ProjetService', () => {
  let service: ProjetService;

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
    service = TestBed.inject(ProjetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
