import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProjetComponent} from './containers/projet/projet.component';
import { ProjetFinancementsComponent } from './components/projet-financements/projet-financements.component';
import { ProjetRecettesComponent } from './components/projet-recettes/projet-recettes.component';
import { ProjetMontantsComponent } from './components/projet-montants/projet-montants.component';
import { ProjetDetailsComponent } from './components/projet-details/projet-details.component';



@NgModule({
  declarations: [
    ProjetComponent,
    ProjetFinancementsComponent,
    ProjetRecettesComponent,
    ProjetMontantsComponent,
    ProjetDetailsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ProjetModule { }
