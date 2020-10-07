import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ProjetComponent } from './components/projet/projet.component';
import { ProjetsComponent } from './components/projets/projets.component';
import { ConnexionComponent } from './components/connexion/connexion.component';
import { RapportsComponent } from './components/rapports/rapports.component';
import { ResponsablesComponent } from './components/responsables/responsables.component';
import { FinanceursComponent } from './components/financeurs/financeurs.component';
import { DepensesComponent } from './components/depenses/depenses.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';

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
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
