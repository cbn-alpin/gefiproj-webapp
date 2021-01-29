import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Roles } from 'src/app/models/roles';
import { AuthService } from './auth.service';
import { EnsureAuthenticatedService } from './ensure-authenticated.service';

/**
 * Indique si l'utilisateur est authentifié en tant qu'administrateur.
 */
@Injectable({
  providedIn: 'root'
})
export class IsAdministratorGuardService implements CanActivate {

  /**
   * Indique si l'utilisateur est authentifié en tant qu'administrateur.
   * @param authSrv : permet de récupérer l'utilisateur authentifié.
   * @param authGuard : permet de naviguer vers la page de connexion s'il n'y a pas de session courante.
   */
  constructor(
    private authSrv: AuthService,
    private authGuard: EnsureAuthenticatedService) { }

  /**
   * Indique si l'utilisateur est un administrateur.
   */
  public isAdministrator(): boolean {
    try {
      const userAuth = this.authSrv.userAuth;
      const isAuth = this.authSrv.isAuthenticated()
        || this.authSrv.canRefreshToken(); // Pour éviter des effets indésirables

      return isAuth
        && !!userAuth
        && userAuth.roles
        && userAuth.roles.indexOf(Roles.Admin) >= 0;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Vérifie et indique si l'utilisateur est authentifié en tant qu'administrateur.
   * Dans le cas contraire, il sera redirigé vers la page de connexion.
   * @returns indique si l'utilisateur est authentifié comme administrateur.
   */
  public async canActivate(): Promise<boolean> {
    try {
      const isAuth = await this.authGuard.canActivate();

      if (!isAuth) {
        return false;
      }

      return this.isAdministrator();
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
