import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { Role } from 'src/app/models/role';
import { tokenGetter } from '../../app.module';
import { Utilisateur } from '../../models/utilisateur';
import { AuthService } from './auth.service';
import { UserLogin } from './user-login';
import { UtilisateurToken } from './utilisateurToken';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let jwtSrv: JwtHelperService;
  const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDI0Mjk1MzIsIm5iZiI6MTYwMjQyOTUzMiwianRpIjoiY2RiYmY4ZmEtOWUyNi00YzhmLTg3NWEtMzJhNjVmYWI1ZDM5IiwiZXhwIjoxNjAyNDMwNDMyLCJpZGVudGl0eSI6ImNhc2gxUCIsImZyZXNoIjpmYWxzZSwidHlwZSI6ImFjY2VzcyJ9.kSiPmWzZUwK2OrxgbXKg5-sZE7XdFBH2F8PZYbP5SkI';
  const refreshToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MDI0Mjk1MzIsIm5iZiI6MTYwMjQyOTUzMiwianRpIjoiNjY1ODk4YjQtYjU0ZC00MDA0LTk2NzYtODEyZWI4YmY1MmM0IiwiZXhwIjoxNjA1MDIxNTMyLCJpZGVudGl0eSI6ImNhc2gxUCIsInR5cGUiOiJyZWZyZXNoIn0.-gUtHowxRs09IMZ5Rw4VBvBJo0gQa0-jYGgxtimFDM0';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter
          }
        })
      ]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    jwtSrv = TestBed.inject(JwtHelperService);

    // Nettoyage
    localStorage.removeItem(AuthService.tokenKey);
  });

  afterEach(() => {
    httpTestingController.verify({ ignoreCancelled: true });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated -> false car pas de Token dans localStorage', () => {
    localStorage.removeItem(AuthService.tokenKey);

    const isAuth = service.isAuthenticated();

    expect(isAuth).toBeFalse(); // Pas authentifié
  });

  it('isAuthenticated -> true', () => {
    localStorage.setItem(AuthService.tokenKey, accessToken);
    spyOn(jwtSrv, 'isTokenExpired').and
      .returnValue(false);

    const isAuth = service.isAuthenticated(); // Action

    expect(isAuth).toBeTrue(); // Authentifié
  });

  it('isAuthenticated -> false car Token périmé', () => {
    localStorage.setItem(AuthService.tokenKey, accessToken);
    spyOn(jwtSrv, 'isTokenExpired').and
      .returnValue(true);

    const isAuth = service.isAuthenticated(); // Action

    expect(isAuth).toBeFalse(); // Pas authentifié
  });

  it('logout -> à partir d\'une session', async () => {
    const userLogin: UserLogin = {
      login: '',
      password: ''
    };
    const user: UtilisateurToken = {
      id_u: 5,
      nom_u: '',
      prenom_u: '',
      email_u: '',
      initiales_u: '',
      role: Role.Consultant,
      active_u: true,
      access_token: accessToken
    };
    const promiseLogin = service.login(userLogin); // Connexion
    const req = httpTestingController.expectOne(AuthService.LOGIN_URL);
    req.flush(user);
    await promiseLogin;

    service.logout(); // Action

    const isAuth = service.isAuthenticated();
    expect(isAuth).toBeFalse(); // Pas authentifié
  });

  it('login -> ok retourne un user et son Token', async () => {
    const userLogin: UserLogin = {
      login: '',
      password: ''
    };
    const user: UtilisateurToken = {
      id_u: 5,
      nom_u: '',
      prenom_u: '',
      email_u: '',
      initiales_u: '',
      role: Role.Consultant,
      active_u: true,
      access_token: accessToken
    };
    let userInObs: Utilisateur;
    service.userObservable
      .subscribe(u => userInObs = u);
    spyOn(jwtSrv, 'isTokenExpired').and
      .returnValue(false);

    const promise = service.login(userLogin);

    const req = httpTestingController.expectOne(AuthService.LOGIN_URL);
    req.flush(user);
    await expectAsync(promise).toBeResolvedTo(user); // Retourne l'utilisateur
    expect(service.userAuth).toEqual(user); // Fourni l'utilisateur
    expect(userInObs).toEqual(user); // Notification d'un nouvel utilisateur
    expect(service.accessToken).toEqual(accessToken); // Token d'accès
    const isAuth = service.isAuthenticated();
    expect(isAuth).toBeTrue(); // Est authentifié
  });

  it('login -> Erreur propagée suite à erreur serveur (normalement 401)', async () => {
    const userLogin: UserLogin = {
      login: '',
      password: ''
    };

    const promise = service.login(userLogin);

    const req = httpTestingController.expectOne(AuthService.LOGIN_URL);
    const errorMsg = '!!!';
    const error = new ErrorEvent(errorMsg);
    req.error(error);
    await expectAsync(promise).toBeRejected();
  });
});
