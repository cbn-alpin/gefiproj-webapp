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
export class ProjetComponent implements OnInit, OnDestroy {
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

  public subscription: Subscription;

  public projectIsBalanced: boolean;


  constructor(
    private projetService: ProjetService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idProjet =  Number(this.route.snapshot.paramMap.get('id'));
    this.state$ = this.route.paramMap
      .pipe(map(() => window.history.state));
    this.subscription = this.state$.subscribe((state) => {
      this.projectIsBalanced = state.projectIsBalanced;
    })
    this.getFinancementsFromProjet(idProjet);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public async getFinancementsFromProjet(idProjet: number) {
    this.financements = await this.projetService.getAllFinancementsFromProjet(idProjet);
  }

  public async getRecettesFromFinancemennt(financement: Financement) {
    this.selectedFinancement = financement;
    this.recettes = await this.projetService.getAllRecettesFromFinancement(financement);
  }


}
