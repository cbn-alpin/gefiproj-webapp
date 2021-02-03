import { HomeComponent } from './../home/home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../connexion/connexion.component';
import { RapportsComponent } from './rapports.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('RapportsComponent', () => {
  let component: RapportsComponent;
  let fixture: ComponentFixture<RapportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        ),
        MatSnackBarModule
      ],
      providers: [
        FormBuilder
      ],
      declarations: [ RapportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RapportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
