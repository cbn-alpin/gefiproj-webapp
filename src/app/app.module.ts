import { registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnexionComponent } from './components/connexion/connexion.component';
import { DepensesComponent } from './components/depenses/depenses.component';
import { FinancementsComponent } from './components/financements/financements.component';
import { FinanceursComponent } from './components/financeurs/financeurs.component';
import { GenericTableDemoModule } from './components/generic-table-demo/generic-table-demo.module';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { ProjetComponent } from './components/projet/projet.component';
import { RapportsComponent } from './components/rapports/rapports.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';
import { AuthService } from './services/authentication/auth.service';
import { AuthenticationHttpInterceptorService } from './services/authentication/authentication-http-interceptor.service';
import { SharedModule } from './shared/shared.module';
import { MontantsAffectesComponent } from './components/montants-affectes/montants-affectes.component';
import {MatCheckboxModule} from '@angular/material/checkbox';

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
    FinancementsComponent,
    ConnexionComponent,
    RapportsComponent,
    FinanceursComponent,
    DepensesComponent,
    UtilisateursComponent,
    HeaderComponent,
    MontantsAffectesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    MatSlideToggleModule,
    NgxSpinnerModule,
    GenericTableDemoModule,
    SharedModule,
    MatCheckboxModule
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
