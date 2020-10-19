import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnexionComponent } from './components/connexion/connexion.component';
import { DepensesComponent } from './components/depenses/depenses.component';
import { FinanceursComponent } from './components/financeurs/financeurs.component';
import { HomeComponent } from './components/home/home.component';
import { ProjetComponent } from './components/projet/projet.component';
import { ProjetsComponent } from './components/projets/projets.component';
import { RapportsComponent } from './components/rapports/rapports.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';
import { AuthService } from './services/authentication/auth.service';
import { AuthenticationHttpInterceptorService } from './services/authentication/authentication-http-interceptor.service';
import { HeaderComponent } from './components/header/header.component';

/**
 * Retourne le token courant.
 */
export function tokenGetter(): string {
  return localStorage.getItem(AuthService.tokenKey);
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProjetComponent,
    ProjetsComponent,
    ConnexionComponent,
    RapportsComponent,
    FinanceursComponent,
    DepensesComponent,
    UtilisateursComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        disallowedRoutes: [/.*\/api\/auth\/.*/]
      }
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationHttpInterceptorService,
      multi: true
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
