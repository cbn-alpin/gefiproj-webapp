import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../components/connexion/connexion.component';
import { HomeComponent } from '../components/home/home.component';
import { PreviousReceiptsService } from './previous-receipts.service';

describe('EntreesSortiesService', () => {
  let service: PreviousReceiptsService;

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
    service = TestBed.inject(PreviousReceiptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
