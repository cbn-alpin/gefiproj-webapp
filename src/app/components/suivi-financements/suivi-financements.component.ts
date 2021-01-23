import { Component, OnInit } from '@angular/core';
import { SuiviFinancement } from '../../models/suivi-financement';
import { SuiviFinancementsFakeService } from '../../fakes/suivi-financements-fake.service';
import { GenericTableOptions } from '../../shared/components/generic-table/models/generic-table-options';
import { EntityType } from '../../shared/components/generic-table/models/entity-types';
import { GenericTableCellType } from '../../shared/components/generic-table/globals/generic-table-cell-types';
import { ActivatedRoute } from '@angular/router';
import { GenericTableColor } from '../../shared/components/generic-table/globals/generic-table-color';
import { Statut_F } from '../../models/financement';

@Component({
  selector: 'app-suivi-financements',
  templateUrl: './suivi-financements.component.html',
  styleUrls: ['./suivi-financements.component.scss'],
})
export class SuiviFinancementsComponent implements OnInit {
  public annee1: number;
  public annee2: number;
  public suiviFinancementsVersion1: SuiviFinancement[];
  public suiviFinancementsVersion2: SuiviFinancement[];

  /**
   * Titre du tableau
   */
  public title: string;

  /**
   * Options du tableau
   */
  public options: GenericTableOptions<SuiviFinancement>;

  /**
   * Indique si le tableau est en lecture seule.
   */
  public get isReadOnly(): boolean {
    return true;
  }

  /**
   * Extraire les noms de chaque propriétés du type Suivie Financement vers une énumération.
   * Cette énumération facilite le paramétrage du tableau.
   * @private
   */
  private EntityPropertyName = {
    CODE_PROJET: 'code_p',
    NOM_PROJET: 'nom_p',
    FINANCEUR: 'nom_financeur',
    RESPONSABLE: 'initiales_u',
    DATE_ARRETE: 'date_arrete_f',
    DATE_LIMITE_SOLDE: 'date_limite_solde_f',
    MONTANT_ARRETE: 'montant_arrete_f',
    RECETTES_AVANT_ANNEE_1: 'recettes_avant_annee_1',
    RECETTES_ANNEE_1: 'recettes_annee_1',
    RECETTES_ANNEE_2: 'recettes_annee_2',
    RECETTES_ANNEE_3: 'recettes_annee_3',
    RECETTES_ANNEE_4: 'recettes_annee_4',
    RECETTES_APRES_ANNEE_4: 'recettes_apres_annee_4',
    COMMENTAIRES: 'commentaire',
    NUM_TITRE: 'numero_titre_f',
    IMPUTATION: 'imputation',
  };

  /**
   * Tableau des types de l'entité suivi financements
   * @private
   */
  private entityTypes: EntityType[] = [
    {
      name: 'Code projet',
      type: GenericTableCellType.NUMBER,
      code: this.EntityPropertyName.CODE_PROJET,
    },
    {
      name: 'Nom projet',
      type: GenericTableCellType.TEXT,
      code: this.EntityPropertyName.NOM_PROJET,
    },
    {
      name: 'Financeur',
      type: GenericTableCellType.TEXT,
      code: this.EntityPropertyName.FINANCEUR,
    },
    {
      name: 'Responsable',
      type: GenericTableCellType.TEXT,
      code: this.EntityPropertyName.RESPONSABLE,
    },
    {
      name: 'Date arrêté',
      type: GenericTableCellType.TEXT,
      code: this.EntityPropertyName.DATE_ARRETE,
    },
    {
      name: 'Date limite de solde',
      type: GenericTableCellType.TEXT,
      code: this.EntityPropertyName.DATE_LIMITE_SOLDE,
    },
    {
      name: 'Montant arrêté',
      type: GenericTableCellType.CURRENCY,
      code: this.EntityPropertyName.MONTANT_ARRETE,
    },
    {
      name: 'Recettes avant 20',
      type: GenericTableCellType.CURRENCY,
      code: this.EntityPropertyName.RECETTES_AVANT_ANNEE_1,
    },
    {
      name: 'Recettes 20',
      type: GenericTableCellType.CURRENCY,
      code: this.EntityPropertyName.RECETTES_ANNEE_1,
    },
    {
      name: 'Recettes 21',
      type: GenericTableCellType.CURRENCY,
      code: this.EntityPropertyName.RECETTES_ANNEE_2,
    },
    {
      name: 'Recettes 22',
      type: GenericTableCellType.CURRENCY,
      code: this.EntityPropertyName.RECETTES_ANNEE_3,
    },
    {
      name: 'Recettes 23',
      type: GenericTableCellType.CURRENCY,
      code: this.EntityPropertyName.RECETTES_ANNEE_4,
    },
    {
      name: 'Recettes après 23',
      type: GenericTableCellType.CURRENCY,
      code: this.EntityPropertyName.RECETTES_APRES_ANNEE_4,
    },
    {
      name: 'Commentaires',
      type: GenericTableCellType.TEXT,
      code: this.EntityPropertyName.COMMENTAIRES,
    },
    {
      name: 'N°titre',
      type: GenericTableCellType.TEXT,
      code: this.EntityPropertyName.NUM_TITRE,
    },
    {
      name: 'Imputation',
      type: GenericTableCellType.TEXT,
      code: this.EntityPropertyName.IMPUTATION,
    },
  ];

  constructor(
    private readonly _suiviFinancementsFakeService: SuiviFinancementsFakeService,
    private readonly _route: ActivatedRoute
  ) {}

  public async ngOnInit(): Promise<void> {
    this.annee1 = +this._route.snapshot.queryParamMap.get('annee1');
    this.annee2 = +this._route.snapshot.queryParamMap.get('annee2');

    if (this.annee1 && this.annee2) {
      this.suiviFinancementsVersion2 = await this._suiviFinancementsFakeService.getAllVersion2(
        this.annee1,
        this.annee2
      );
      this.title = `Suivi des financements / Version 2 de ${this.annee1} à ${this.annee2}`;
      this.initGenericTableOptions(this.suiviFinancementsVersion2);
    } else {
      this.suiviFinancementsVersion1 = await this._suiviFinancementsFakeService.getAllVersion1();
      this.title = 'Suivi des financements / Version 1';
      this.initGenericTableOptions(this.suiviFinancementsVersion1);
    }
  }

  public getColor(suiviFinancement: SuiviFinancement): GenericTableColor {
    return suiviFinancement.statut_f === Statut_F.SOLDE
      ? GenericTableColor.YELLOW
      : suiviFinancement.statut_f === Statut_F.ATR
      ? GenericTableColor.ORANGE
      : null;
  }

  /**
   * Initialisation des options du tableau générique
   * @private
   */
  private initGenericTableOptions(data: SuiviFinancement[]): void {
    this.options = {
      dataSource: data,
      defaultEntity: null,
      entitySelectBoxOptions: [],
      entityTypes: this.entityTypes,
      entityPlaceHolders: null,
    };
  }
}
