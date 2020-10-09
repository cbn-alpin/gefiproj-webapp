import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Utilisateur } from '../models/utilisateur';
import { User } from './user';

/**
 * Gère l'authentification de l'utilisateur avec le serveur.
 * @see https://realpython.com/user-authentication-with-angular-4-and-flask/
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * URL de base des requêtes.
   */
  private readonly BASE_URL = '/api/auth';

  /**
   * Header à injecter à chaque requête.
   */
  private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  /**
   * Clef de stockage du Token de connexion pour l'utilisateur.
   */
  private readonly tokenKey = 'token';

  /**
   * Publie les différentes sessions de l'utilisateur.
   */
  private readonly userSubject = new Subject<Utilisateur>();

  /**
   * Retourne un observable sur la session de l'utilisateur.
   */
  public get userObservable(): Observable<Utilisateur> {
    return this.userSubject.asObservable();
  }

  /**
   * Retourne le Token courant depuis le stockage.
   */
  private get token(): string {
    return localStorage.getItem(this.tokenKey) || null;
  }

  constructor(private http: HttpClient) { }

  /**
   * Authentifie l'utilisateur.
   * @param user : Login et password.
   */
  async login(user: User): Promise<Utilisateur> {
    try {
      const url = `${this.BASE_URL}/login`;

      const utilisateur = await this.http
        .post<Utilisateur>(
          url,
          user, {
          headers: this.headers
        })
        .toPromise();

      return this.next(utilisateur);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Vérifie que l'utilisateur possède un Token valide.
   */
  async ensureAuthenticated(): Promise<boolean> {
    try {
      // 1. Vérification depuis le stockage
      const token = this.token;

      if (!token) {
        return false;
      }

      // 2. Vérification sur le serveur
      // Paramétrage pour vérification sur serveur
      const url = `${this.BASE_URL}/status`;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      });

      // Vérification
      await this.http.get(url, {
        headers
      })
        .toPromise();

      return true;
    } catch (error) {
      console.error(error);
      this.save(null);
      return Promise.reject(error);
    }
  }

  /**
   * Enregistre l'utilisateur authentifié. De plus, enregistre son Token de connexion dans le LocalStorage.
   * @param utilisateur : utilisateur authentifié.
   */
  private next(utilisateur: Utilisateur): Utilisateur {
    try {
      this.userSubject.next(utilisateur);

      const token = this.getToken(utilisateur);
      this.save(token);

      return utilisateur;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Retourne le Token de connexion associé à l'utilisateur, ou null en cas de problème.
   * @param utilisateur : utilisateur authentifié.
   */
  private getToken(utilisateur: Utilisateur): string {
    return utilisateur && utilisateur.access_token
      ? utilisateur.access_token
      : null;
  }

  /**
   * Enregistre le Token dans le LocalStorage.
   * @param token : Token à enregistrer.
   */
  private save(token: string): void {
    try {
      const isAuth = !!token;

      if (isAuth) {
        localStorage.setItem(this.tokenKey, token);
      } else {
        localStorage.removeItem(this.tokenKey);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
