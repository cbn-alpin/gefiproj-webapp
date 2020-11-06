import { Component, OnInit } from '@angular/core';
import { Financement, Statut_F } from 'src/app/models/financement';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableInterface } from 'src/app/shared/components/generic-table/models/generic-table-interface';
import { GenericTableOptions } from 'src/app/shared/components/generic-table/models/generic-table-options';
import { EntityType } from 'src/app/shared/components/generic-table/models/entity-types';
import { EntitySelectBoxOptions } from 'src/app/shared/components/generic-table/models/entity-select-box-options';
import { EntityPlaceholder } from 'src/app/shared/components/generic-table/models/entity-placeholder';
import { FinancementsService } from 'src/app/services/financements.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-projets',
  templateUrl: './projets.component.html',
  styleUrls: ['./projets.component.scss']
})
export class ProjetsComponent implements OnInit, GenericTableInterface<Financement>  {

  /**
   * Titre du tableau générique
   */
  public title = 'Financement Test';

  /**
   * id projet
   */
  public projectId: string;

  /**
   * Options du tableau générique: données sources, entité par défaut, types des entités, les options des select box, les placeholders
   */
  public options: GenericTableOptions<Financement>;

  /**
   * Données source du tableau générique
   * @private
   */
  public dataSource: Financement[];

  /**
   * Entité par défaut utilisé lors de la création d'une nouvelle financement
   * @private
   */
  private defaultEntity: Financement = {
    id_p: undefined,
    id_financeur: undefined,
    montant_arrete_f: 0,
    date_arrete_f: undefined,
    date_limite_solde_f: undefined,
    statut_f: Statut_F.ANTR,
    date_solde_f: undefined,
    commentaire_admin_f: undefined,
    commentaire_resp_f: undefined,
    numero_titre_f: undefined,
    annee_titre_f: undefined,
    imputation_f: undefined,
    difference: undefined
  };

  /**
   * Extraire les noms de chaque propriétés du type Famille vers une énumération.
   * Cette énumération nous facilite la vie.
   * Attention: le nom de la propriété dans l'énum doit correspondre au nom de la propriété du type
   * -> Ex: ORIGINE: 'origine' mais pas 'Origine'
   * -> C'est pour cette raison qu'on extrait directement le nom de l'objet grâce à Object.keys
   * TODO: Trouver une meilleur solution
   * @private
   */
  private EntityPropertyName = {
    PROJET: Object.keys(this.defaultEntity)[0],
    FINANCEUR: Object.keys(this.defaultEntity)[1],
    MONTANT_ARRETE: Object.keys(this.defaultEntity)[2],
    DATE_ARRETE: Object.keys(this.defaultEntity)[3],
    DATE_LIMITE_SOLDE: Object.keys(this.defaultEntity)[4],
    STATUT: Object.keys(this.defaultEntity)[5],
    DATE_SOLDE: Object.keys(this.defaultEntity)[6],
    COMMENTAIRE_ADMIN: Object.keys(this.defaultEntity)[7],
    COMMENTAIRE_RESP: Object.keys(this.defaultEntity)[8],
    NUMERO_TITRE: Object.keys(this.defaultEntity)[9],
    ANNEE_TITRE: Object.keys(this.defaultEntity)[10],
    IMPUTATION: Object.keys(this.defaultEntity)[11],
    DIFFERENCE: Object.keys(this.defaultEntity)[12],
  };

  /**
   * Tableau des types de l'entité financement
   * @private
   */
  private entityTypes: EntityType[] = [
    {name: this.EntityPropertyName.MONTANT_ARRETE, type: GenericTableCellType.CURRENCY},
    {name: this.EntityPropertyName.DATE_ARRETE, type: GenericTableCellType.DATE},
    {name: this.EntityPropertyName.DATE_SOLDE, type: GenericTableCellType.DATE},
    {name: this.EntityPropertyName.FINANCEUR, type: GenericTableCellType.SELECTBOX},
    {name: this.EntityPropertyName.STATUT, type: GenericTableCellType.SELECTBOX},
    {name: this.EntityPropertyName.COMMENTAIRE_ADMIN, type: GenericTableCellType.TEXT},
    {name: this.EntityPropertyName.COMMENTAIRE_RESP, type: GenericTableCellType.TEXT},
    {name: this.EntityPropertyName.NUMERO_TITRE, type: GenericTableCellType.TEXT},
    {name: this.EntityPropertyName.ANNEE_TITRE, type: GenericTableCellType.TEXT},
    {name: this.EntityPropertyName.IMPUTATION, type: GenericTableCellType.TEXT},
    {name: this.EntityPropertyName.DIFFERENCE, type: GenericTableCellType.CURRENCY}
  ];

  /**
   * Tablau des options des select box de l'entité financement
   * @private
   */
  private entitySelectBoxOptions: EntitySelectBoxOptions[] = [
    {
      name: this.EntityPropertyName.FINANCEUR,
      values: [
        {code: 1, value: 1},
      ]
    },
    {
      name: this.EntityPropertyName.STATUT,
      values: [
        {code:'ANTR', value: Statut_F.ANTR},
        {code:'ATR', value: Statut_F.ATR},
        {code:'SOLDE', value: Statut_F.SOLDE},
      ]
    }
  ];

  /**
   * Tableau des placeholders de l'entité financement
   * @private
   */
  private entityPlaceHolders: EntityPlaceholder[] = [
    {name: this.EntityPropertyName.MONTANT_ARRETE, value: 'Montant Arreté'},
    {name: this.EntityPropertyName.DATE_ARRETE, value: 'Date arreté ou commande'},
    {name: this.EntityPropertyName.DATE_SOLDE, value: 'Date soldé'},
    {name: this.EntityPropertyName.FINANCEUR, value: 'Financeur'},
    {name: this.EntityPropertyName.STATUT, value: 'Statut'},
    {name: this.EntityPropertyName.COMMENTAIRE_ADMIN, value: 'Commentaire admin'},
    {name: this.EntityPropertyName.COMMENTAIRE_RESP, value: 'Commentaire responsable'},
    {name: this.EntityPropertyName.NUMERO_TITRE, value: 'Numéro titre'},
    {name: this.EntityPropertyName.ANNEE_TITRE, value: 'Année titre'},
    {name: this.EntityPropertyName.IMPUTATION, value: 'Imputation'},
    {name: this.EntityPropertyName.DIFFERENCE, value: 'Différence'}
  ];

  constructor(
    private financementsService: FinancementsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.params.id;
    if(!this.projectId) this.router.navigate(['home'])
    this.loadFinancements(this.projectId).then( () => {
      this.options = {
        dataSource: this.dataSource,
        defaultEntity: this.defaultEntity,
        entitySelectBoxOptions: this.entitySelectBoxOptions,
        entityTypes: this.entityTypes,
        entityPlaceHolders: this.entityPlaceHolders
      };
    });
  }

  /**
   * Charge les projets depuis le serveur.
   */
  async loadFinancements(projetId: string): Promise<Financement[]> {
    try {
      const financements = await this.financementsService.get_by_id(projetId);
      this.dataSource = financements;
      financements.forEach( res => {
        res.difference = 0;
      });
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
