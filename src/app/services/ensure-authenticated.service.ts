import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * Vérifie que l'utilisateur est authentifié.
 * @see https://realpython.com/user-authentication-with-angular-4-and-flask/
 */
@Injectable({
  providedIn: 'root'
})
export class EnsureAuthenticatedService {
  constructor(private auth: AuthService, private router: Router) { }

  /**
   * Vérifie que l'utilisateur est authentifié. Dans le cas contraire, il sera redirigé vers la page de connexion.
   * @returns indique si l'utilisateur est authentifié.
   * @see https://realpython.com/user-authentication-with-angular-4-and-flask/
   */
  canActivate(): Observable<boolean> {
    return from(this.auth.ensureAuthenticated())
      .pipe(tap(isAuth => {
        if (!isAuth) { // Utilisateur non authentifié => page de connexion
          this.router.navigateByUrl('/login');
        }
      }));
  }
}
