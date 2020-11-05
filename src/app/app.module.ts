import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {LOCALE_ID, NgModule} from '@angular/core';
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
import {GenericTableDemoModule} from './components/generic-table-demo/generic-table-demo.module';
import {SharedModule} from './shared/shared.module';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';

/**
 * Retourne le token courant.
 */
export function tokenGetter(): string {
  return localStorage.getItem(AuthService.tokenKey);
}

/**
 * Variable localeFr utilisé lors du formatage d'un nombre vers le format français (nombre transformé en montant  €).
 * Ex: 14572 -> 14 572 €
 */
registerLocaleData(localeFr, 'fr-FR');


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
    }),
    GenericTableDemoModule,
    SharedModule
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
