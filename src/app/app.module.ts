import { registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnexionComponent } from './components/connexion/connexion.component';
import { DepensesComponent } from './components/depenses/depenses.component';
import { EntreesSortiesComponent } from './components/entrees-sorties/entrees-sorties.component';
import { FinancementsComponent } from './components/financements/financements.component';
import { FinanceursComponent } from './components/financeurs/financeurs.component';
import { HeaderComponent } from './components/header/header.component';
import { HistoriqueComponent } from './components/historique/historique.component';
import { HomeComponent } from './components/home/home.component';
import { MontantsAffectesComponent } from './components/montants-affectes/montants-affectes.component';
import {
  EditProjectDialogComponent,
  ProjetComponent
} from './components/projet/projet.component';
import { RapportsComponent } from './components/rapports/rapports.component';
import { RecettesComptablesComponent } from './components/recettes-comptables/recettes-comptables.component';
import { RecettesComponent } from './components/recettes/recettes.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';
import { AuthService } from './services/authentication/auth.service';
import { AuthenticationHttpInterceptorService } from './services/authentication/authentication-http-interceptor.service';
import { SharedModule } from './shared/shared.module';

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
    ConnexionComponent,
    RapportsComponent,
    FinanceursComponent,
    DepensesComponent,
    UtilisateursComponent,
    HeaderComponent,
    FinancementsComponent,
    RecettesComponent,
    FinanceursComponent,
    ProjetComponent,
    MontantsAffectesComponent,
    EditProjectDialogComponent,
    RecettesComptablesComponent,
    EntreesSortiesComponent,
    HistoriqueComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    MatSlideToggleModule,
    NgxSpinnerModule,
    SharedModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationHttpInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
