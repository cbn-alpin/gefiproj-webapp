import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../components/connexion/connexion.component';
import { HomeComponent } from '../components/home/home.component';
import { AmountsService } from './amounts.service';

describe('AmountsService', () => {
  let service: AmountsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        ),
        MatSnackBarModule,
        MatDialogModule
      ]
    });
    service = TestBed.inject(AmountsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
