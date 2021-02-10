/* tslint:disable:no-unused-variable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../connexion/connexion.component';
import { HomeComponent } from '../home/home.component';
import { RecettesComptablesComponent } from './recettes-comptables.component';

describe('RecettesComptablesComponent', () => {
  let component: RecettesComptablesComponent;
  let fixture: ComponentFixture<RecettesComptablesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'connexion', component: ConnexionComponent },
          { path: 'home', component: HomeComponent },
        ]),
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
      ],
      declarations: [ RecettesComptablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecettesComptablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
