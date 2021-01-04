import { Injectable } from '@angular/core';
import { NavigationService } from '../navigation.service';
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
   * @param navSrv : service de navigation.
   */
  constructor(
    private authSrv: AuthService,
    private navSrv: NavigationService) { }

  /**
   * Vérifie que l'utilisateur est authentifié. Dans le cas contraire, il sera redirigé vers la page de connexion.
   * @returns indique si l'utilisateur est authentifié.
   */
  public canActivate(): boolean {
    try {
      ////////////////////////////////////////////
      //todo à désactiver tant que l'API de Token n'est pas fournie !!
      return true;
      ////////////////////////////////////////////

      const isAuth = this.authSrv.isAuthenticated();

      if (!isAuth) { // Affiche page d'authentification
        this.navSrv.goToLogin();
      }

      return isAuth;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
