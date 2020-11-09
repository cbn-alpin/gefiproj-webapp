import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { Utilisateur } from '../../models/utilisateur';
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
   * Publie les différentes sessions de l'utilisateur.
   */
  private readonly userSubject = new BehaviorSubject<Utilisateur>(null);

  /**
   * Utilisateur authentifié.
   */
  private utilisateur: Utilisateur = null;

  /**
   * Utilisateur authentifié.
   */
  public get userAuth(): Utilisateur {
    return this.utilisateur || null;
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
   * Gère l'authentification de l'utilisateur avec le serveur.
   * @param http : permet de lancer des requêtes.
   * @param jwtSrv : gère le Token.
   */
  constructor(private http: HttpClient, private jwtSrv: JwtHelperService) {
    try {
      this.next(null);
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

      const utilisateur = await this.http
        .post<UtilisateurToken>(
          url,
          userLogin, {
          headers: new HttpHeaders(AuthService.headers)
        })
        .toPromise();

      return this.next(utilisateur);
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

      if (accessToken) {
        const url = AuthService.LOGOUT_URL;

        await this.http
          .post(
            url,
            accessToken, {
            headers: new HttpHeaders(AuthService.headers)
          })
          .toPromise();
      }

      this.next(null);
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
      const token = this.accessToken;

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
   * Notifie de l'authentifié et enregistre le Token de connexion correspondant dans le LocalStorage.
   * @param utilisateur : utilisateur authentifié. Si null, alors supprime la session.
   */
  private next(utilisateur?: UtilisateurToken): Utilisateur {
    try {
      utilisateur = utilisateur || null;
      const token = this.extractToken(utilisateur);

      this.save(token);
      this.notify(utilisateur);

      return this.utilisateur = utilisateur;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Notifie d'une nouvelle authentification.
   * @param utilisateur : utilisateur authentifié.
   */
  private notify(utilisateur?: UtilisateurToken): void {
    try {
      this.userSubject.next(utilisateur);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Retourne le Token de connexion associé à l'utilisateur, ou null en cas de problème. Le Token est retiré de l'objet.
   * @param utilisateur : utilisateur authentifié.
   */
  private extractToken(utilisateur: UtilisateurToken): string {
    try {
      const token = utilisateur && utilisateur.access_token
        ? utilisateur.access_token
        : null;

      if (token) { // Retrait du Token
        delete utilisateur.access_token;

        if (utilisateur.refresh_token) {
          delete utilisateur.refresh_token;
        }
      }

      return token;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Enregistre le Token dans le LocalStorage.
   * @param token : Token à enregistrer. Si null, alors supprime la session.
   */
  private save(token: string): void {
    try {
      const isAuth = !!token
        && !this.jwtSrv.isTokenExpired(token);

      if (isAuth) {
        localStorage.setItem(AuthService.tokenKey, token);
      } else {
        localStorage.removeItem(AuthService.tokenKey);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
