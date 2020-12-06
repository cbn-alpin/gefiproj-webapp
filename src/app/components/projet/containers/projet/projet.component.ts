import {Component, OnInit} from '@angular/core';
import {ProjetService} from "../../services/projet.service";
import {Recette} from "../../../../models/recette";
import {Financement} from "../../../../models/financement";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.scss']
})
export class ProjetComponent implements OnInit {

  /**
   * Liste des financements associè au projet
   */
  public financements: Financement[];

  /**
   * Liste des recettes associé au financement sélectionné
   */
  public recettes: Recette[];

  /**
   * Financement séléctionné dans le tableau
   */
  public selectedFinancement: Financement;


  constructor(
    private projetService: ProjetService,
    private route: ActivatedRoute
  ) {
    const idProjet =  Number(this.route.snapshot.paramMap.get('id'));
    this.getFinancementsFromProjet(idProjet);
  }

  ngOnInit(): void {}

  public async getFinancementsFromProjet(idProjet: number) {
    this.financements = await this.projetService.getAllFinancementsFromProjet(idProjet);
  }

  public async getRecettesFromFinancemennt(financement: Financement) {
    this.selectedFinancement = financement;
    this.recettes = await this.projetService.getAllRecettesFromFinancement(financement);
  }


}
