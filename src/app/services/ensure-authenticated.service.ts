import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Vérifie que l'utilisateur est authentifié.
 * @see https://realpython.com/user-authentication-with-angular-4-and-flask/
 */
@Injectable({
  providedIn: 'root'
})
export class EnsureAuthenticatedService {
  constructor(private authSrv: AuthService, private router: Router) { }

  /**
   * Vérifie que l'utilisateur est authentifié. Dans le cas contraire, il sera redirigé vers la page de connexion.
   * @returns indique si l'utilisateur est authentifié.
   */
  canActivate(): boolean {
    const isAuth = this.authSrv.isAuthenticated();

    if (!isAuth) {
      this.router.navigateByUrl('/login');
    }

    return isAuth;
  }
}
