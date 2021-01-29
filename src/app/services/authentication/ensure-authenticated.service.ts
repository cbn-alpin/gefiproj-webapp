import { MatSnackBar } from '@angular/material/snack-bar';
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
   * @param snackBar : affiche une information.
   * @param authSrv : service de gestion de l'authentification.
   */
  constructor(
    private snackBar: MatSnackBar,
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
        } else {
          this.authSrv.logout();
        }
      }

      if (isAuth) {
        return true;
      }
    } catch (error) {
      console.error(error);
    }

    this.showInformation('Action non autorisée !');
    return false;
  }

  /**
   * Affiche une information.
   * @param message : message à afficher.
   */
  private showInformation(message: string): void {
    try {
      this.snackBar.open(
        message,
        'OK', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    } catch (error) {
      console.error(error);
    }
  }
}
