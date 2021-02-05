import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../connexion/connexion.component';
import { HomeComponent } from '../home/home.component';
import { UtilisateursComponent } from './utilisateurs.component';

describe('UtilisateursComponent', () => {
  let component: UtilisateursComponent;
  let fixture: ComponentFixture<UtilisateursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'connexion', component: ConnexionComponent },
          { path: 'home', component: HomeComponent },
        ]),
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
      ],
      declarations: [ UtilisateursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilisateursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
