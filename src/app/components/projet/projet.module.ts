import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjetComponent} from './containers/projet/projet.component';
import {ProjetRecettesComponent} from './components/projet-recettes/projet-recettes.component';
import {ProjetMontantsComponent} from './components/projet-montants/projet-montants.component';
import {ProjetDetailsComponent} from './components/projet-details/projet-details.component';
import {SharedModule} from "../../shared/shared.module";
import {FinancementsComponent} from "./components/financements/financements.component";


@NgModule({
  declarations: [
    ProjetComponent,
    ProjetRecettesComponent,
    ProjetMontantsComponent,
    ProjetDetailsComponent,
    FinancementsComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class ProjetModule { }
