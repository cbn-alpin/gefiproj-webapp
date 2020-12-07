import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Recette} from "../../../../models/recette";
import {GenericTableOptions} from "../../../../shared/components/generic-table/models/generic-table-options";
import {EntityType} from "../../../../shared/components/generic-table/models/entity-types";
import {GenericTableCellType} from "../../../../shared/components/generic-table/globals/generic-table-cell-types";
import {EntityPlaceholder} from "../../../../shared/components/generic-table/models/entity-placeholder";
import {GenericTableFormError} from "../../../../shared/components/generic-table/models/generic-table-entity";
import {GenericTableEntityEvent} from "../../../../shared/components/generic-table/models/generic-table-entity-event";
import {ProjetService} from "../../services/projet.service";
import {Financement, Statut_F} from "../../../../models/financement";
import {isNotNullOrUndefined} from "codelyzer/util/isNotNullOrUndefined";

@Component({
  selector: 'app-projet-recettes',
  templateUrl: './projet-recettes.component.html',
  styleUrls: ['./projet-recettes.component.scss']
})
export class ProjetRecettesComponent implements OnInit, OnChanges {

  /**
   * Financement sélectionné
   */
  @Input() public financement: Financement;

  /**
   * Recettes du financement sélectionné
   */
  @Input() public recettes: Recette[];

  /**
   * Titre du tableau
   */
  public title = 'Recettes';

  /**
   * Options du tableau
   */
  public options: GenericTableOptions<Recette>;

  /**
   * Obtenir les informations d'une recette
   * @param entity
   */
  public getEntityInformationsCallBack: Function;

  public Statut_F = Statut_F;

  /**
   * Entité par défaut utilisé lors de la création d'une nouvelle recette
   * @private
   */
  private defaultEntity: Recette = {
    annee_r: 2020,
    montant_r: 0
  };

  /**
   * Extraire les noms de chaque propriétés du type Recette vers une énumération.
   * Cette énumération facilite le paramétrage du tableau.
   * @private
   */
  private EntityPropertyName = {
    ANNEE_RECETTE: Object.keys(this.defaultEntity)[0],
    MONTANT: Object.keys(this.defaultEntity)[1]
  };

  /**
   * Tableau des types de l'entité recette
   * @private
   */
  private entityTypes: EntityType[] = [
    {name: 'Année recette', type: GenericTableCellType.NUMBER, code: this.EntityPropertyName.ANNEE_RECETTE},
    {name: 'Montant', type: GenericTableCellType.CURRENCY, code: this.EntityPropertyName.MONTANT}
  ];

  /**
   * Tableau des placeholders de l'entité recette
   * @private
   */
  private entityPlaceHolders: EntityPlaceholder[] = [
    {name: this.EntityPropertyName.ANNEE_RECETTE, value: '2019'},
    {name: this.EntityPropertyName.MONTANT, value: '25 000'}
  ];

  constructor(
   private projetService: ProjetService
  ) { }

  ngOnInit(): void {
    this.initGenericTableOptions();
    this.getEntityInformationsCallBack = this.getEntityInformations.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recettes && changes.recettes.currentValue) {
      this.initGenericTableOptions();
    }
  }

  /**
   * Initialisation des options du tableau générique
   * @private
   */
  private initGenericTableOptions(): void {
    this.options = {
      dataSource: this.recettes,
      defaultEntity: this.defaultEntity,
      entitySelectBoxOptions: [],
      entityTypes: this.entityTypes,
      entityPlaceHolders: this.entityPlaceHolders
    };
  }

  /**
   * Une recette a été créé et on l'initialise dans le tableau.
   * @param event : encapsule la recette à créer.
   */
  async onCreate(event: GenericTableEntityEvent<Recette>): Promise<void> {
    const formErrors = this.handleFormErrors(event.entity);
    if (formErrors) {
      event.callBack({formErrors});
    } else {
        try {
          const newRecette = await this.projetService.addRecetteToFinancement(event.entity, this.financement, this.recettes);
          this.recettes = this.recettes.concat(newRecette);
          event.callBack(null);
        } catch (error) {
          console.error(error);
          event?.callBack({
            apiError: error
          });
        }
    }
  }

  /**
   * Une recette a été modifié dans le tableau.
   * @param event : encapsule la recette à modifier.
   */
  async onEdit(event: GenericTableEntityEvent<Recette>): Promise<void> {
    const formErrors = this.handleFormErrors(event.entity);
    if (formErrors) {
      event.callBack({formErrors});
    } else {
      try {
        const updatedRecette = await this.projetService.modifyRecette(event.entity, this.financement, this.recettes);
        const index = this.recettes.findIndex((r) => {
          const id = r?.id_r || (r as any)?.id; // Pour json-server

          return id === updatedRecette.id_r;
        });
        this.recettes[index] = updatedRecette;
        event.callBack(null);
      } catch (error) {
        console.error(error);
        event?.callBack({
          apiError: error
        });
      }
    }
  }

  /**
   * Une recette a été supprimé du tableau.
   * @param event : encapsule lea recette à modifier.
   */
  async onDelete(event: GenericTableEntityEvent<Recette>): Promise<void> {
    try {
      const deletedRecette = await this.projetService.deleteRecette(event.entity);
      this.recettes = this.recettes.filter((recette) => {
        const id = recette?.id_r || (recette as any)?.id; // Pour json-server

        return id !== deletedRecette.id_r;
      });
      event.callBack(null);
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: error
      });
    }
  }

  /**
   * Vérifier le format de chaque champs de l'entité recette
   * @param entity
   */
  public handleFormErrors(entity: Recette): GenericTableFormError[] {
    let genericTableFormErrors: GenericTableFormError[] = [];
    genericTableFormErrors = this.getAnneeRecetteFormError(entity.annee_r, genericTableFormErrors);
    genericTableFormErrors = this.getMontantFormError(entity.montant_r, genericTableFormErrors);
    return genericTableFormErrors.length > 0 ? genericTableFormErrors : undefined;
  }

  /**
   * Vérifier le format du champ 'annee_recette'
   * @param annee_recette
   * @param genericTableFormErrors
   */
  public getAnneeRecetteFormError(
    annee_recette: number,
    genericTableFormErrors: GenericTableFormError[]): GenericTableFormError[] {
    let msg = '';
    if (!annee_recette) {
      msg = 'Année recette requise';
    } else if (!/^(\d{4})$/.test(String(annee_recette))) {
      msg = 'Format année non respecté';
    }
    if (msg !== '') {
      genericTableFormErrors = genericTableFormErrors.concat({
        name: this.EntityPropertyName.ANNEE_RECETTE,
        message: msg
      });
    }
    return genericTableFormErrors;
  }

  /**
   * Vérifier le format du champ 'montant'
   * @param montant
   * @param genericTableFormErrors
   */
  public getMontantFormError(
    montant: number,
    genericTableFormErrors: GenericTableFormError[]): GenericTableFormError[] {
    let msg = '';
    if (!isNotNullOrUndefined(montant)) {
      msg = 'Montant requis';
    } else if (montant <= 0) {
      msg = 'Le montant doit être supérieur à 0';
    }
    if (msg !== '') {
      genericTableFormErrors = genericTableFormErrors.concat({
        name: this.EntityPropertyName.MONTANT,
        message: msg
      });
    }
    return genericTableFormErrors;
  }

  /**
   * Renvoie les informations d'une recette
   * @param entity
   */
  public getEntityInformations(recette?: Recette): string {
    return recette ? "Recette: [année = " + recette.annee_r + ", montant = " + recette.montant_r + "]" : "";
  }

}
