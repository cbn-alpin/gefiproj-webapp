import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from 'src/app/components/connexion/connexion.component';
import { HomeComponent } from 'src/app/components/home/home.component';
import { GenericTableTypeService } from './generic-table-type.service';

describe('GenericTableTypeService', () => {
  let service: GenericTableTypeService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        ),
        MatSnackBarModule
    ]});
    service = TestBed.inject(GenericTableTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
