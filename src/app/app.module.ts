import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { ResponsablesComponent } from './components/responsables/responsables.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';
import { AuthService } from './services/auth.service';
import { AuthenticationHttpInterceptorService } from './services/authentication-http-interceptor.service';
import { EnsureAuthenticatedService } from './services/ensure-authenticated.service';

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
    ResponsablesComponent,
    FinanceursComponent,
    DepensesComponent,
    UtilisateursComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    JwtModule.forRoot({
      config: {
        tokenGetter
      }
    })
  ],
  providers: [
    AuthService,
    EnsureAuthenticatedService,
    AuthenticationHttpInterceptorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
