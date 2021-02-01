import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../connexion/connexion.component';
import { ProjetComponent } from './projet.component';
import {
  MockPopupService,
  PopupService,
} from '../../shared/services/popup.service';
import { HomeComponent } from '../home/home.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ProjetComponent', () => {
  let component: ProjetComponent;
  let fixture: ComponentFixture<ProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'connexion', component: ConnexionComponent },
          { path: 'home', component: HomeComponent },
        ]),
        MatDialogModule,
        MatSnackBarModule,
      ],
      declarations: [ProjetComponent],
      providers: [
        {
          provide: PopupService,
          useClass: MockPopupService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
