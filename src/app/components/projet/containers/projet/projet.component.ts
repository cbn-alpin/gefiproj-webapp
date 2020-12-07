import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProjetService} from "../../services/projet.service";
import {Recette} from "../../../../models/recette";
import {Financement} from "../../../../models/financement";
import {ActivatedRoute} from "@angular/router";
import {Observable, Subscription} from "rxjs";
import {map} from "rxjs/operators";
import {ProjetNavigationState} from "../../../../models/projet";

@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.scss']
})
export class ProjetComponent implements OnInit {
  /**
   * State de la navigation, contient l'attribut projectIsBalanced
   */
  public state$: Observable<ProjetNavigationState>;

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

  public idProject: number;


  constructor(
    private projetService: ProjetService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.idProject =  Number(this.route.snapshot.paramMap.get('id'));
    this.state$ = this.route.paramMap
      .pipe(map(() => window.history.state));
    this.getFinancementsFromProjet(this.idProject);
  }

  public async getFinancementsFromProjet(idProjet: number) {
    this.financements = await this.projetService.getAllFinancementsFromProjet(idProjet);
  }

  public async getRecettesFromFinancemennt(financement: Financement) {
    this.recettes = await this.projetService.getAllRecettesFromFinancement(financement);
  }

  public onSelectFinancement(financement: Financement): void {
    this.selectedFinancement = financement;
    this.getRecettesFromFinancemennt(financement);
  }


}
