import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnexionComponent } from './components/connexion/connexion.component';
import { DepensesComponent } from './components/depenses/depenses.component';
import { FinanceursComponent } from './components/financeurs/financeurs.component';
import { HomeComponent } from './components/home/home.component';
import { ProjetComponent } from './components/projet/projet.component';
import { ProjetsComponent } from './components/projets/projets.component';
import { RapportsComponent } from './components/rapports/rapports.component';
import { ResponsablesComponent } from './components/responsables/responsables.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';
import { EnsureAuthenticatedService } from './services/ensure-authenticated.service';

const routes: Routes = [
  {
    path: 'connexion',
    component: ConnexionComponent
  },
  {
    path: 'depenses',
    component: DepensesComponent
  },
  {
    path: 'financeurs',
    component: FinanceursComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'projet/:id',
    component: ProjetComponent,
    canActivate: [EnsureAuthenticatedService]
  },
  {
    path: 'projets',
    component: ProjetsComponent
  },
  {
    path: 'rapport',
    component: RapportsComponent
  },
  {
    path: 'responsables',
    component: ResponsablesComponent
  },
  {
    path: 'utilisateurs',
    component: UtilisateursComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
