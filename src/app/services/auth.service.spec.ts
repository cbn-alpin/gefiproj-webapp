import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { tokenGetter } from '../app.module';
import { Utilisateur } from './../models/utilisateur';
import { AuthService } from './auth.service';
import { UserLogin } from './user-login';
import { UtilisateurToken } from './utilisateurToken';

fdescribe('AuthService', () => {
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
        })]
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

    expect(isAuth).toBeFalse();
  });

  it('isAuthenticated -> true', async () => {
    localStorage.setItem(AuthService.tokenKey, accessToken);
    spyOn(jwtSrv, 'isTokenExpired').and
      .returnValue(false);

    const promise = service.isAuthenticated(); // Action

    expect(promise).toBeTrue();
  });

  it('isAuthenticated -> false car Token périmé', async () => {
    localStorage.setItem(AuthService.tokenKey, accessToken);
    spyOn(jwtSrv, 'isTokenExpired').and
      .returnValue(true);

    const promise = service.isAuthenticated(); // Action

    expect(promise).toBeFalse();
  });

  it('logout -> à partir d\'une session', async () => {
    const userLogin: UserLogin = {
      login: '',
      password: ''
    };
    const user: UtilisateurToken = {
      id: 5,
      nom: '',
      prenom: '',
      mail: '',
      role: 0,
      access_token: accessToken
    };
    const promiseLogin = service.login(userLogin); // Connexion
    const req = httpTestingController.expectOne(AuthService.LOGIN_URL);
    req.flush(user);
    await promiseLogin;

    service.logout(); // Action

    const isAuth = service.isAuthenticated();
    expect(isAuth).toBeFalse();
  });

  it('login -> ok retourne un user et son Token', async () => {
    const userLogin: UserLogin = {
      login: '',
      password: ''
    };
    const user: UtilisateurToken = {
      id: 5,
      nom: '',
      prenom: '',
      mail: '',
      role: 0,
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
    await expectAsync(promise).toBeResolvedTo(user);
    expect(service.userAuth).toEqual(user);
    expect(userInObs).toEqual(user);
    expect(service.accessToken).toEqual(accessToken);
    const isAuth = service.isAuthenticated();
    expect(isAuth).toBeTrue();
  });

  it('login -> Erreur', async () => {
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
