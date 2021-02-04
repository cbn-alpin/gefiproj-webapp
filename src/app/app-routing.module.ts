import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnexionComponent } from './components/connexion/connexion.component';
import { DepensesComponent } from './components/depenses/depenses.component';
import { FinanceursComponent } from './components/financeurs/financeurs.component';
import { HomeComponent } from './components/home/home.component';
import { ProjetComponent } from './components/projet/projet.component';
import { RapportsComponent } from './components/rapports/rapports.component';
import { RecettesComptablesComponent } from './components/recettes-comptables/recettes-comptables.component';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs.component';
import { EnsureAuthenticatedService } from './services/authentication/ensure-authenticated.service';
import { IsAdministratorGuardService } from './services/authentication/is-administrator-guard.service';

const routes: Routes = [
  {
    path: 'connexion',
    component: ConnexionComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [EnsureAuthenticatedService],
  },
  {
    path: 'financeurs',
    component: FinanceursComponent,
    canActivate: [EnsureAuthenticatedService],
  },
  {
    path: 'depenses',
    component: DepensesComponent,
    canActivate: [EnsureAuthenticatedService],
  },
  {
    path: 'recette-comptable',
    component: RecettesComptablesComponent,
    canActivate: [EnsureAuthenticatedService],
  },
  {
    path: 'projet/:id',
    component: ProjetComponent,
    canActivate: [EnsureAuthenticatedService],
  },
  {
    path: 'rapports',
    component: RapportsComponent,
    canActivate: [EnsureAuthenticatedService],
  },
  {
    path: 'utilisateurs',
    component: UtilisateursComponent,
    canActivate: [IsAdministratorGuardService],
  },
  /* TODO: Supprimer le chemin 'tabledemo'
  {
    path: 'tabledemo',
    component: GenericTableDemoComponent,
  },*/
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
    canActivate: [EnsureAuthenticatedService],
  },
  {
    path: '**',
    component: HomeComponent,
    canActivate: [EnsureAuthenticatedService],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
