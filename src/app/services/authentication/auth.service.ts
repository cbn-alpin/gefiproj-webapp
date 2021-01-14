import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { Utilisateur } from '../../models/utilisateur';
import { RefreshTokenResponse } from './refreshTokenResponse';
import { UserLogin as UserLogin } from './user-login';
import { UtilisateurToken } from './utilisateurToken';

/**
 * URL de base des requêtes.
 */
const BASE_URL = '/api/auth';

/**
 * Gère l'authentification de l'utilisateur avec le serveur.
 * @see https://realpython.com/user-authentication-with-angular-4-and-flask/
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * URL pour ouvrir une session via un Token.
   */
  public static readonly LOGIN_URL = `${BASE_URL}/login`;

  /**
   * URL pour fermer sa session.
   */
  public static readonly LOGOUT_URL = `${BASE_URL}/logout`;

  /**
   * URL pour rafraichir le Token.
   */
  public static readonly REFRESH_TOKEN_URL = `${BASE_URL}/refresh`;

  /**
   * Header à injecter à chaque requête.
   */
  public static readonly headers = {
    'Content-Type': 'application/json'
  };

  /**
   * Clef de stockage du Token de connexion pour l'utilisateur.
   */
  public static readonly tokenKey = 'token';

  /**
   * Clef de stockage du Refresh Token de connexion pour l'utilisateur.
   */
  public static readonly refreshTokenKey = 'refreshToken';

  /**
   * Clef de stockage pour les données de l'utilisateur connecté.
   */
  public static readonly userKey = 'user';

  /**
   * Permet de valider le Token.
   */
  private jwtSrv: JwtHelperService;

  /**
   * Promise gérant un rafraichissement le Token.
   */
  private promiseRefreshToken: Promise<any> = null;

  /**
   * Publie les différentes sessions de l'utilisateur.
   */
  private readonly userSubject = new BehaviorSubject<Utilisateur>(null);

  /**
   * Utilisateur authentifié.
   */
  private user: Utilisateur = null;

  /**
   * Utilisateur authentifié.
   */
  public get userAuth(): Utilisateur {
    try {
      return this.user
        || JSON.parse(localStorage.getItem(AuthService.userKey))
        || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Retourne un observable sur la session de l'utilisateur.
   */
  public get userObservable(): Observable<Utilisateur> {
    return this.userSubject.asObservable();
  }

  /**
   * Retourne le Token courant depuis le stockage.
   */
  public get accessToken(): string {
    return localStorage.getItem(AuthService.tokenKey) || null;
  }

  /**
   * Retourne le Refresh Token courant depuis le stockage.
   */
  public get refreshTokenStr(): string {
    return localStorage.getItem(AuthService.refreshTokenKey) || null;
  }

  /**
   * Gère l'authentification de l'utilisateur avec le serveur.
   * @param http : permet de lancer des requêtes.
   * @param router : permet de changer de page.
   * @param location : indique la page courante.
   */
  constructor(
    private http: HttpClient,
    private router: Router,
    private location: Location) {
    try {
      this.jwtSrv = new JwtHelperService();
      this.verifyAuthFromStorage();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Authentifie l'utilisateur et ouvre une session (via un Token).
   * @param userLogin : Login et password.
   */
  public async login(userLogin: UserLogin): Promise<Utilisateur> {
    try {
      const url = AuthService.LOGIN_URL;

      const user = await this.http
        .post<UtilisateurToken>(
          url,
          userLogin, {
          headers: new HttpHeaders(AuthService.headers)
        })
        .toPromise();

      return this.next(user);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Déconnecte l'utilisateur.
   */
  public async logout(): Promise<void> {
    try {
      const accessToken = this.accessToken;
      this.clearStorage(); // Fermeture de session côté client

      if (accessToken) { // Fermeture de session côté serveur
        const url = AuthService.LOGOUT_URL;

        // TODO: api/auth/logout non géré par le back pour le moment
        // await this.http
        //   .post(
        //     url,
        //     accessToken, {
        //     headers: new HttpHeaders(AuthService.headers)
        //   })
        //   .toPromise();
      }

      this.next(null); // Notification
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Vérifie que l'utilisateur possède un Token valide.
   */
  public isAuthenticated(): boolean {
    try {
      if (!this.userAuth
        || !this.userAuth.active_u
        || (this.userAuth.roles || []).length === 0) { // Utilisateur inconnu, sans rôle, ou inactif !
        this.logout(); // Note : on n'attend pas
        return false;
      }

      const token = this.accessToken;
      if (!token) { // Pas de Token enregistré !
        this.logout(); // Note : on n'attend pas
        return false;
      }

      const isAuth = !this.jwtSrv.isTokenExpired(token);

      if (isAuth) { // Token valide
        return true;
      } else { // Token invalide => tentative de rafraichissement via le Refresh Token
        // Note : on n'attend pas la fin du rafraichissement
        this.refreshTokenOrLogout();
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  /**
   * Tente de rafraichir le Token via le Refresh Token. En cas d'échec direction la page de connexion.
   */
  public async refreshTokenOrLogout(): Promise<any> {
    try {
      const canRefreshToken = this.canRefreshToken();

      if (canRefreshToken) { // Refresh Token valide => tentative de rafraichissement
        const promiseRefreshToken = this.promiseRefreshToken;

        if (!promiseRefreshToken) { // Token invalide mais Refresh Token valide => rafraichissement du Token
          return await (this.promiseRefreshToken = this.refreshToken()
            .catch(() =>
              this.logout())
            .finally(() =>
              this.promiseRefreshToken = null));
        } else { // Requête déjà en cours
          return await promiseRefreshToken;
        }
      } else {
        return await this.logout();
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Indique si le Refresh Token est valide.
   */
  public canRefreshToken(): boolean {
    try {
      if (!this.userAuth) { // Utilisateur inconnu !
        return false;
      }

      const token = this.refreshTokenStr;
      if (!token) {
        return false;
      }

      return !this.jwtSrv.isTokenExpired(token);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Tente de rafraichir le Token.
   */
  private async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      if (!this.canRefreshToken()) {
        throw new Error('Le Refresh Token n\'est pas valide');
      }

      const url = AuthService.REFRESH_TOKEN_URL;
      const headers = Object.assign({
        Authorization: `Bearer ${this.refreshTokenStr}`
      }, AuthService.headers);

      const access = await this.http
        .post<RefreshTokenResponse>(
          url,
          null, {
          headers: new HttpHeaders(headers)
        })
        .toPromise();

      this.saveInStorage(this.userAuth, access.access_token, access.refresh_token || this.refreshTokenStr || null);
    } catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
  }

  /**
   * Notifie de l'authentifié, enregistre le Token de connexion correspondant dans le LocalStorage
   * et navigue vers le home (ou autre) si connecté sinon vers connexion.
   * @param userWithToken : utilisateur authentifié. Si null, alors supprime la session et navigue jusqu'à la page de connexion.
   */
  private next(userWithToken?: UtilisateurToken): Utilisateur {
    try {
      userWithToken = userWithToken || null;
      let token: string = null;
      let refreshToken: string = null;

      if (userWithToken) { // Utilisateur + token fournis en paramètre
        ({ token, refreshToken } = this.extractToken(userWithToken));
      }

      this.saveAndNavigate(userWithToken, token, refreshToken);
    } catch (error) {
      console.error(error);
    }

    return this.userAuth;
  }

  /**
   * Enregistre les informations de connexion puis navigue vers la page appropriée.
   * @param user : utilisateur connecté.
   * @param token : token de connexion.
   * @param refreshToken : Refresh Token.
   */
  private saveAndNavigate(user: Utilisateur, token: string, refreshToken?: string): void {
    const pathConnexion = '/connexion';
    const pathHome = '/home';
    const isAuth = user
      && token
      && (this.verifyToken(token) || this.verifyToken(refreshToken));

    if (isAuth) { // Enregistrement puis direction la page d'accueil (ou autre)
      this.saveInStorage(user, token, refreshToken);
      this.notify(user);

      const location = this.location.path();
      const goTo = location && location !== pathConnexion
        ? location
        : pathHome;
      this.router.navigate([goTo]);
    } else { // Nettoyage puis direction la page de connexion
      this.clearStorage();
      this.notify(null);
      this.router.navigate([pathConnexion]);
    }
  }

  /**
   * Récupère les informations de connexion via le storage et notifie le système.
   */
  private verifyAuthFromStorage(): void {
    try {
      let user: Utilisateur = null;
      let token: string = null;
      let refreshToken: string = null;

      ({ user, token, refreshToken } = this.getFromStorage());

      if (user && token) {
        const userWithToken: UtilisateurToken = Object.assign({
          access_token: token,
          refresh_token: refreshToken
        },
          user);

        this.next(userWithToken);
      } else { // Rien dans le storage
        this.next(null);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Retourne les informations de connexion depuis le storage.
   */
  private getFromStorage(): { user: Utilisateur, token: string, refreshToken: string } {
    try {
      const userStr = localStorage.getItem(AuthService.userKey);
      const user = userStr ? JSON.parse(userStr) as Utilisateur : null;
      const token = localStorage.getItem(AuthService.tokenKey) || null;
      const refreshToken = localStorage.getItem(AuthService.refreshTokenKey) || null;

      return { user, token, refreshToken };
    } catch (error) {
      console.error(error);
    }

    return { user: null, token: null, refreshToken: null };
  }

  /**
   * Notifie d'une nouvelle authentification.
   * @param utilisateur : utilisateur authentifié.
   */
  private notify(utilisateur?: Utilisateur): void {
    try {
      this.userSubject.next(utilisateur);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Retourne le Token de connexion (et son Refresh Token) associé à l'utilisateur,
   * ou null en cas de problème. Le Token est retiré de l'objet.
   * @param utilisateur : utilisateur authentifié.
   */
  private extractToken(utilisateur: UtilisateurToken): { token: string, refreshToken: string } {
    try {
      const token = utilisateur?.access_token || null;
      const refreshToken = utilisateur?.refresh_token || null;

      if (token) { // Retrait du Token
        delete utilisateur.access_token;

        if (utilisateur.refresh_token) {
          delete utilisateur.refresh_token;
        }
      }

      return { token, refreshToken };
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Enregistre le Token dans le LocalStorage.
   * @param user : Utilisateur connecté. Si null, alors supprime la session.
   * @param token : Token à enregistrer. Si null, alors supprime la session.
   * @param refreshToken : Refresh Token à enregistrer.
   */
  private saveInStorage(user: Utilisateur, token: string, refreshToken?: string): void {
    try {
      const isAuth = this.verifyToken(token)
        || this.verifyToken(refreshToken);

      if (user && isAuth) {
        this.user = user;
        localStorage.setItem(AuthService.userKey, JSON.stringify(user));
        localStorage.setItem(AuthService.tokenKey, token);
        localStorage.setItem(AuthService.refreshTokenKey, refreshToken || '');
      } else {
        this.clearStorage();
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Vérifie la validité du token.
   * @param token : token à vérifier.
   */
  private verifyToken(token: string): boolean {
    try {
      return !!token
        && !this.jwtSrv.isTokenExpired(token);
      } catch (error) {
        console.error(error);
    }

    return false;
  }

  /**
   * Vide le stockage.
   */
  private clearStorage(): void {
    try {
      this.user = null;
      localStorage.removeItem(AuthService.userKey);
      localStorage.removeItem(AuthService.tokenKey);
      localStorage.removeItem(AuthService.refreshTokenKey);
    } catch (error) {
      console.error(error);
    }
  }
}
