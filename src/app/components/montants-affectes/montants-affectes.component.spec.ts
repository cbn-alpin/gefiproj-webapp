import { HomeComponent } from './../home/home.component';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { MontantsAffectesComponent } from './montants-affectes.component';
import { ConnexionComponent } from '../connexion/connexion.component';

describe('MontantsAffectesComponent', () => {
  let component: MontantsAffectesComponent;
  let fixture: ComponentFixture<MontantsAffectesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MontantsAffectesComponent ],
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        ),
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MontantsAffectesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
