import { HomeComponent } from './../../components/home/home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JwtModule } from '@auth0/angular-jwt';
import { tokenGetter } from 'src/app/app.module';
import { ConnexionComponent } from 'src/app/components/connexion/connexion.component';
import { NavigationService } from '../navigation.service';
import { AuthService } from './auth.service';
import { EnsureAuthenticatedService } from './ensure-authenticated.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('EnsureAuthenticatedService', () => {
  let service: EnsureAuthenticatedService;
  let authSrv: AuthService;
  let navSrv: NavigationService;
  const mockSnapshot = jasmine.createSpyObj<RouterStateSnapshot>(
    'RouterStateSnapshot',
    ['toString']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        ),
        HttpClientTestingModule,
        MatSnackBarModule,
        JwtModule.forRoot({
          config: {
            tokenGetter
          }
        })
      ],
      providers: [
        {
          provide: RouterStateSnapshot,
          useValue: mockSnapshot
        }
      ]
    });
    service = TestBed.inject(EnsureAuthenticatedService);
    authSrv = TestBed.inject(AuthService);
    navSrv = TestBed.inject(NavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('canActivate -> ok', async () => {
    spyOn(authSrv, 'isAuthenticated').and
      .returnValue(true);
    spyOn(navSrv, 'goToLogin').and
      .throwError('bouchonnage'); // Pour être certain que ce n'est pas appelé

    const canActivate = await service.canActivate();

    expect(canActivate).toBeTrue(); // Est authentifié
  });

  it('canActivate -> false, changement de page vers login', async () => {
    let isGoToLogin = false;
    spyOn(authSrv, 'isAuthenticated').and
      .returnValue(false);
    spyOn(authSrv, 'canRefreshToken').and
      .returnValue(false);
    spyOn(authSrv, 'logout').and
      .callFake(() => {
        isGoToLogin = true;
        return Promise.resolve();
      });

    const canActivate = await service.canActivate();

    expect(canActivate).toBeFalse();
    expect(isGoToLogin).toBeTrue(); // Changement de page vers login
  });
});
