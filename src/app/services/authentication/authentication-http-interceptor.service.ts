import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { NavigationService } from '../navigation.service';
import { AuthService } from './auth.service';

/**
 * Injecte le Token dans les requêtes et gère les erreurs 401 sur le serveur.
 * @see https://github.com/keathmilligan/angular-jwt-flask/blob/master/jwt_angular/src/app/services/auth.interceptor.ts
 * @see https://jasonwatmore.com/post/2019/06/22/angular-8-jwt-authentication-example-tutorial
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationHttpInterceptorService implements HttpInterceptor {
  /**
   * Injecte le Token dans les requêtes et gère les erreurs 401 sur le serveur.
   * @param authSrv : permet de récupérer le Token de connexion courant.
   * @param navSrv : permet de basculer sur la page de connexion.
   */
  constructor(
    private authSrv: AuthService,
    private navSrv: NavigationService) {
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
      this.navSrv.goToLogin();

      return throwError(error);
    }
  }

  /**
   * Ajoute le Token aux Headers.
   * @param request : requête lancée.
   * @param stream : pipe.
   * @param next : prochain gestionnaire.
   */
  private addToken(request: HttpRequest<any>, stream: Observable<HttpEvent<any>>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      const isAuthApi = /.*\/api\/auth\/.*/.test(request.url);

      if (!isAuthApi) { // Ajout du Token aux requêtes, si valide, sinon il est préalablement rafraichi
        const isAuth = this.authSrv.isAuthenticated();

        if (isAuth) { // Token valide => Injection du Token
          const reqAuth = this.injectToken(request);
          return next.handle(reqAuth);
        } else if (this.authSrv.canRefreshToken()) { // Token invalide, mais Refresh Token valide => rafraichissement du Token
          return from(this.authSrv.refreshTokenOrLogout())
              .pipe(
                switchMap(() => {
                  return next.handle(this.injectToken(request));
                }),
                catchError((error: any) => {
                  this.authSrv.logout();
                  return throwError(error);
              }));
        }
      }
    } catch (error) {
      console.error(error);
    }

    return stream;
  }

  /**
   * Injecte le Token dans l'en-tête.
   * @param request : requette où effectuer l'injection.
   */
  private injectToken(request: HttpRequest<any>): HttpRequest<any> {
    const accessToken = this.authSrv.accessToken;

    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
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
      if (err?.status === 401) { // Fermeture de session
        this.authSrv.logout();
        this.navSrv.goToLogin();
      }

      // Relance l'erreur
      return throwError(err || null);
    } catch (error) {
      console.error(error);
      return throwError(error);
    }
  }
}
