import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProjetComponent} from './containers/projet/projet.component';
import { ProjetDetailsComponent } from './components/projet-details/projet-details.component';
import { ProjetFinancementsComponent } from './components/projet-financements/projet-financements.component';
import { ProjetRecettesComponent } from './components/projet-recettes/projet-recettes.component';
import { ProjetMontantsComponent } from './components/projet-montants/projet-montants.component';



@NgModule({
  declarations: [
    ProjetComponent,
    ProjetDetailsComponent,
    ProjetFinancementsComponent,
    ProjetRecettesComponent,
    ProjetMontantsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ProjetModule { }
