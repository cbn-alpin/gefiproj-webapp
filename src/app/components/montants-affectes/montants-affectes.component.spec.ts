import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MontantsAffectesComponent } from './montants-affectes.component';
import { ConnexionComponent } from '../connexion/connexion.component';
import {
  MockPopupService,
  PopupService,
} from '../../shared/services/popup.service';
import { HomeComponent } from '../home/home.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('MontantsAffectesComponent', () => {
  let component: MontantsAffectesComponent;
  let fixture: ComponentFixture<MontantsAffectesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MontantsAffectesComponent],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'connexion', component: ConnexionComponent },
          { path: 'home', component: HomeComponent },
        ]),
        HttpClientTestingModule,
        MatDialogModule,
        MatSnackBarModule,
      ],
      providers: [
        {
          provide: PopupService,
          useClass: MockPopupService,
        },
      ],
    }).compileComponents();
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
