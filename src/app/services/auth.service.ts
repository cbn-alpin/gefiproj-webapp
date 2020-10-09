import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Utilisateur } from '../models/utilisateur';
import { User } from './user';
import { Observable, Subject } from 'rxjs';

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
   * 
   */
  private readonly _userObservable = new Subject<Utilisateur>();
  private readonly tokenKey = "token";

  /**
   * @returns 
   */
  public get userObservable(): Observable<Utilisateur> {
    return this._userObservable.asObservable();
  }

  private get token(): string {
    return localStorage.getItem(this.tokenKey) || null;
  }

  constructor(private http: HttpClient) { }

  /**
   * 
   * @param user 
   */
  async login(user: User): Promise<Utilisateur> {
    try {
      const url: string = `${this.BASE_URL}/login`;

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

  async ensureAuthenticated(): Promise<boolean> {
    try {
      const token = this.token;

      if (!token) {
        return false;
      }

      const url: string = `${this.BASE_URL}/status`;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      });

      await this.http.get(url, { headers: headers })
        .toPromise();

      return true;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * 
   * @param utilisateur 
   */
  private next(utilisateur: Utilisateur): Utilisateur {
    try {
      this._userObservable.next(utilisateur);
      this.save(utilisateur);

      return utilisateur;
    } catch (error) {
      console.error(error);
    }
  }

  private save(utilisateur: Utilisateur) {
    try {
      const isAuth = utilisateur
        && utilisateur.access_token;

      if (isAuth) {
        localStorage.setItem(this.tokenKey, utilisateur.access_token);
      } else {
        localStorage.removeItem(this.tokenKey);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
