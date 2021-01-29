import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../connexion/connexion.component';
import { HomeComponent } from '../home/home.component';
import { RecettesComponent } from './recettes.component';

describe('RecettesComponent', () => {
  let component: RecettesComponent;
  let fixture: ComponentFixture<RecettesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        RecettesComponent],
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        ),
        HttpClientTestingModule,
        MatSnackBarModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecettesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
