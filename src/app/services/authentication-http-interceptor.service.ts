import { AuthService } from 'src/app/services/auth.service';
import { Observable, throwError } from 'rxjs';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 *  @see https://github.com/keathmilligan/angular-jwt-flask/blob/master/jwt_angular/src/app/services/auth.interceptor.ts
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationHttpInterceptorService implements HttpInterceptor {
  constructor(
    private authSrv: AuthService,
    private router: Router) {
  }

  /**
   * Ajoute le token de session aux requêtes.
   * @param req : Requête vers serveur.
   * @param next : Prochain gestionnaire.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      if (!/.*\/api\/auth\/.*/.test(req.url)) {
        const accessToken = this.authSrv.accessToken;

        if (accessToken) {
          const reqAuth = req.clone({
            setHeaders: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          return next.handle(reqAuth);
        }
      }

      return next.handle(req);
    } catch (error) {
      console.error(error);
      this.router.navigate(['/login']);

      return throwError(error);
    }
  }
}
