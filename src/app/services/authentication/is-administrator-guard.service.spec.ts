/* tslint:disable:no-unused-variable */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JwtModule } from '@auth0/angular-jwt';
import { tokenGetter } from 'src/app/app.module';
import { Role } from 'src/app/models/role';
import { Utilisateur } from 'src/app/models/utilisateur';
import { NavigationService } from '../navigation.service';
import { AuthService } from './auth.service';
import { EnsureAuthenticatedService } from './ensure-authenticated.service';
import { IsAdministratorGuardService } from './is-administrator-guard.service';

describe('Service: IsAdministratorGuard', () => {
  let service: IsAdministratorGuardService;
  let authSrv: AuthService;
  let authGuard: EnsureAuthenticatedService;
  let navSrv: NavigationService;
  const mockSnapshot = jasmine.createSpyObj<RouterStateSnapshot>(
    'RouterStateSnapshot',
    ['toString']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter
          }
        })
      ],
      providers: [
        IsAdministratorGuardService,
        NavigationService,
        {
          provide: RouterStateSnapshot,
          useValue: mockSnapshot
        }
      ]
    });
    service = TestBed.inject(IsAdministratorGuardService);
    authSrv = TestBed.inject(AuthService);
    authGuard = TestBed.inject(EnsureAuthenticatedService);
    navSrv = TestBed.inject(NavigationService);
  });

  it('should ...', () => {
    expect(service).toBeTruthy();
  });

  it('isAdministrator -> true', async () => {
    const user: Utilisateur = {
      id: 5,
      nom: '',
      prenom: '',
      mail: '',
      initiales: '',
      role: Role.Admin
    };
    spyOnProperty(authSrv, 'userAuth', 'get').and
      .returnValue(user);
    spyOn(authSrv, 'isAuthenticated').and
      .returnValue(true);

    const isAdmin = service.isAdministrator();

    expect(isAdmin).toBeTrue(); // Est authentifié + admin
  });

  it('isAdministrator -> false car juste en consultation', async () => {
    const user: Utilisateur = {
      id: 5,
      nom: '',
      prenom: '',
      mail: '',
      initiales: '',
      role: Role.Consultant
    };
    spyOnProperty(authSrv, 'userAuth', 'get').and
      .returnValue(user);
    spyOn(authSrv, 'isAuthenticated').and
      .returnValue(true);

    const isAdmin = service.isAdministrator();

    expect(isAdmin).toBeFalse(); // Est authentifié mais pas en admin
  });

  it('isAdministrator -> false car pas authentifié', async () => {
    spyOnProperty(authSrv, 'userAuth', 'get').and
      .returnValue(null);
    spyOn(authSrv, 'isAuthenticated').and
      .returnValue(false);

    const isAdmin = service.isAdministrator();

    expect(isAdmin).toBeFalse();
  });

  it('canActivate -> false car pas authentifié', async () => {
    spyOnProperty(authSrv, 'userAuth', 'get').and
      .returnValue(null);
    spyOn(service, 'isAdministrator').and
      .returnValue(true);
    spyOn(authGuard, 'canActivate').and
      .returnValue(false);

    const isAdmin = service.canActivate();

    expect(isAdmin).toBeFalse();
  });

  it('canActivate -> false car pas admin', async () => {
    spyOnProperty(authSrv, 'userAuth', 'get').and
      .returnValue(null);
    spyOn(service, 'isAdministrator').and
      .returnValue(false);
    spyOn(authGuard, 'canActivate').and
      .returnValue(true);

    const isAdmin = service.canActivate();

    expect(isAdmin).toBeFalse();
  });

  it('canActivate -> true', async () => {
    spyOnProperty(authSrv, 'userAuth', 'get').and
      .returnValue(null);
    spyOn(service, 'isAdministrator').and
      .returnValue(true);
    spyOn(authGuard, 'canActivate').and
      .returnValue(true);

    const isAdmin = service.canActivate();

    expect(isAdmin).toBeTrue();
  });
});