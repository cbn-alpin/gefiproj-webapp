import { AuthService } from 'src/app/services/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';

/**
 * Injecte le Token dans les requêtes.
 * @see https://github.com/keathmilligan/angular-jwt-flask/blob/master/jwt_angular/src/app/services/auth.interceptor.ts
 * @see https://jasonwatmore.com/post/2019/06/22/angular-8-jwt-authentication-example-tutorial
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationHttpInterceptorService implements HttpInterceptor {
  constructor(
    private authSrv: AuthService,
    private router: Router,
    private state: RouterStateSnapshot) {
  }

  /**
   * Ajoute le token de session aux requêtes.
   * @param req : Requête vers serveur.
   * @param next : Prochain gestionnaire.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      let stream = next.handle(req);

      stream = this.addToken(req, stream, next);
      return this.pipeCatchErrorAuth(stream);
    } catch (error) {
      console.error(error);
      this.goToLogin();

      return throwError(error);
    }
  }

  /**
   * Ajoute le Token aux Headers.
   * @param req : requête lancée.
   * @param stream : pipe.
   * @param next : prochain gestionnaire.
   */
  private addToken(req: HttpRequest<any>, stream: Observable<HttpEvent<any>>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      const isAuthApi = /.*\/api\/auth\/.*/.test(req.url);

      if (!isAuthApi) { // Ajout du Token aux requêtes
        const accessToken = this.authSrv.accessToken;
        const isAuth = accessToken
          && this.authSrv.isAuthenticated();

        if (isAuth) {
          const reqAuth = req.clone({
            setHeaders: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          stream = next.handle(reqAuth);
        }
      }
    } catch (error) {
      console.error(error);
    }

    return stream;
  }

  /**
   * Gère les erreurs d'authentification.
   * @param stream : pipe.
   */
  private pipeCatchErrorAuth(stream: Observable<HttpEvent<any>>): Observable<HttpEvent<any>> {
    return stream.pipe(catchError(err =>
      this.catchErrorAuth(err)
    ));
  }

  /**
   * Gère les erreurs d'authentification.
   * @param err : Erreur HTTP.
   */
  private catchErrorAuth(err: any): Observable<never> {
    try {
      if (err.status === 401) { // Fermeture de session
        this.authSrv.logout();
        this.goToLogin();
      }

      // Relance l'erreur
      const error = err?.error?.message || err?.statusText;
      return throwError(error);
    } catch (error) {
      console.error(error);
      return throwError(error);
    }
  }

  /**
   * Retourne à la page d'authentification.
   */
  private goToLogin(): void {
    try {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.state.url
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
}
