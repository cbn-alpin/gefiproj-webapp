import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Vérifie que l'utilisateur est authentifié.
 * @see https://realpython.com/user-authentication-with-angular-4-and-flask/
 */
@Injectable({
  providedIn: 'root'
})
export class EnsureAuthenticatedService {
  /**
   * Vérifie que l'utilisateur est authentifié.
   * @param authSrv : service de gestion de l'authentification.
   */
  constructor(
    private authSrv: AuthService) { }

  /**
   * Vérifie que l'utilisateur est authentifié. Dans le cas contraire, il sera redirigé vers la page de connexion.
   * @returns indique si l'utilisateur est authentifié.
   */
  public async canActivate(): Promise<boolean> {
    try {
      let isAuth = this.authSrv.isAuthenticated();

      if (!isAuth) { // Le Token n'est pas valide => vérification du Refresh Token
        if (this.authSrv.canRefreshToken) {
          await this.authSrv.refreshTokenOrLogout();
          isAuth = this.authSrv.isAuthenticated();
        }
      }

      return isAuth;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
