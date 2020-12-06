import { Component, OnInit } from '@angular/core';
import { GenericTableCellType } from '../../../../shared/components/generic-table/globals/generic-table-cell-types';
import { EntityPlaceholder } from '../../../../shared/components/generic-table/models/entity-placeholder';
import { EntitySelectBoxOptions } from '../../../../shared/components/generic-table/models/entity-select-box-options';
import { EntityType } from '../../../../shared/components/generic-table/models/entity-types';
import { GenericTableEntityErrors, GenericTableFormError } from '../../../../shared/components/generic-table/models/generic-table-entity';
import { GenericTableEntityEvent } from '../../../../shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableInterface } from '../../../../shared/components/generic-table/models/generic-table-interface';
import { GenericTableOptions } from '../../../../shared/components/generic-table/models/generic-table-options';
import { FamilleOrigine } from '../../globals/famille-origine';
import { familleMock } from '../../mocks/famille-mock';
import { Famille } from '../../models/famille';
import { FamilleResponseDummy } from '../../models/famille-response-dummy';
import { GenericTableDemoService } from '../../services/generic-table-demo.service';

@Component({
  selector: 'app-famille-table',
  templateUrl: './famille-table.component.html',
  styleUrls: ['./famille-table.component.scss']
})
export class FamilleTableComponent implements OnInit, GenericTableInterface<Famille> {

  /**
   * Titre du tableau générique
   */
  public title = 'Familles';

  /**
   * Options du tableau générique: données sources, entité par défaut, types des entités, les options des select box, les placeholders
   */
  public options: GenericTableOptions<Famille>;

  /**
   * Données source du tableau générique
   * @private
   */
  private dataSource: Famille[] = familleMock;

  /**
   * Entité par défaut utilisé lors de la création d'une nouvelle famille
   * @private
   */
  private defaultEntity: Famille = {
    origine: FamilleOrigine.ASIE,
    membres: undefined,
    existante: false,
    date_creation: undefined,
    montant_tresorerie: 0
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
    ORIGINE: Object.keys(this.defaultEntity)[0],
    MEMBRES: Object.keys(this.defaultEntity)[1],
    EXISTANTE: Object.keys(this.defaultEntity)[2],
    DATE_CREATION: Object.keys(this.defaultEntity)[3],
    MONTANT_TRESORERIE: Object.keys(this.defaultEntity)[4]
  };

  /**
   * Tableau des types de l'entité famille
   * @private
   */
  private entityTypes: EntityType[] = [
    {name: 'Origine', type: GenericTableCellType.SELECTBOX, code: this.EntityPropertyName.ORIGINE},
    {name: 'Membres', type: GenericTableCellType.NUMBER, code: this.EntityPropertyName.MEMBRES},
    {name: 'Existe ?', type: GenericTableCellType.BOOLEAN, code: this.EntityPropertyName.EXISTANTE},
    {name: 'Date de création', type: GenericTableCellType.DATE, code: this.EntityPropertyName.DATE_CREATION},
    {
      name: 'Montant',
      type: GenericTableCellType.CURRENCY,
      code: this.EntityPropertyName.MONTANT_TRESORERIE}
  ];

  /**
   * Tablau des options des select box de l'entité famille
   * @private
   */
  private entitySelectBoxOptions: EntitySelectBoxOptions[] = [
    {
      name: this.EntityPropertyName.ORIGINE,
      values: [
        FamilleOrigine.AMERICAINE,
        FamilleOrigine.EUROPE,
        FamilleOrigine.ASIE
      ]
    }
  ];

  /**
   * Tableau des placeholders de l'entité famille
   * @private
   */
  private entityPlaceHolders: EntityPlaceholder[] = [
    {name: this.EntityPropertyName.ORIGINE, value: 'Américaine'},
    {name: this.EntityPropertyName.MEMBRES, value: '523'},
    {name: this.EntityPropertyName.DATE_CREATION, value: '20/10/1758'},
    {name: this.EntityPropertyName.MONTANT_TRESORERIE, value: '50123'},
  ];


  constructor(
    private genericTableDemoService: GenericTableDemoService
  ) {
    this.options = {
      dataSource: this.dataSource,
      defaultEntity: this.defaultEntity,
      entitySelectBoxOptions: this.entitySelectBoxOptions,
      entityTypes: this.entityTypes,
      entityPlaceHolders: this.entityPlaceHolders
    };
  }

  ngOnInit(): void {
  }

  /**
   * Lorsque l'événement d'édition est reçu, vérifier les erreurs de format puis modifier
   * @param genericTableEntityEvent
   */
  public onEdit(genericTableEntityEvent: GenericTableEntityEvent<Famille>): void {
    const genericTableEntityErrors = this.edit(genericTableEntityEvent.entity);
    genericTableEntityEvent.callBack(genericTableEntityErrors);
  }

  /**
   * Lorsque l'événement de création est reçu, vérifier les erreurs de format puis créer
   * @param genericTableEntityEvent
   */
  public onCreate(genericTableEntityEvent: GenericTableEntityEvent<Famille>): void {
    const genericTableEntityErrors = this.creation(genericTableEntityEvent.entity);
    genericTableEntityEvent.callBack(genericTableEntityErrors);
  }

  /**
   * Lorsque l'événement de supression est reçu, vérifier les erreurs de format puis supprimer
   * @param genericTableEntityEvent
   */
  public onDelete(genericTableEntityEvent: GenericTableEntityEvent<Famille>): void {
    const genericTableEntityErrors = this.delete(genericTableEntityEvent.entity);
    genericTableEntityEvent.callBack(genericTableEntityErrors);
  }

  /**
   * Vérifier le format du champ 'origine'
   * Ex: format invalide, champ requis
   * @param origine
   * @param genericTableFormErrors
   */
  public getOrigineFormError(origine: string, genericTableFormErrors: GenericTableFormError[]): GenericTableFormError[] {
    let msg = '';
    if (!origine) {
      msg = 'Origine requis';
    }
    if (msg !== '') {
      genericTableFormErrors = genericTableFormErrors.concat({
        name: this.EntityPropertyName.ORIGINE,
        message: msg
      });
    }
    return genericTableFormErrors;
  }

  /**
   * Vérifier le format du champ 'membres'
   * Ex: format invalide, champ requis
   * @param membres
   * @param genericTableFormErrors
   */
  public getMembresFormError(membres: number, genericTableFormErrors: GenericTableFormError[]): GenericTableFormError[] {
    let msg = '';
    if (!membres) {
      msg = 'Membres requis';
    }
    if (msg !== '') {
      genericTableFormErrors = genericTableFormErrors.concat({
        name: this.EntityPropertyName.MEMBRES,
        message: msg
      });
    }
    return genericTableFormErrors;
  }

  /**
   * Vérifier le format du champ 'date_creation'
   * Ex: format invalide, champ requis
   * @param dateCreation
   * @param genericTableFormErrors
   */
  public getDateFormError(dateCreation: Date, genericTableFormErrors: GenericTableFormError[]): GenericTableFormError[] {
    let msg = '';
    if (!dateCreation) {
      msg = 'Date requise';
    }
    if (msg !== '') {
      genericTableFormErrors = genericTableFormErrors.concat({
        name: this.EntityPropertyName.DATE_CREATION,
        message: msg
      });
    }
    return genericTableFormErrors;
  }

  /**
   * Vérifier le format du champ 'montant_tresorerie'
   * Ex: format invalide, champ requis
   * @param montantTresorerie
   * @param genericTableFormErrors
   */
  public getMontantTresorerieFormError(
    montantTresorerie: number,
    genericTableFormErrors: GenericTableFormError[]): GenericTableFormError[] {
    let msg = '';
    if (!montantTresorerie) {
      msg = 'Montant requis';
    }
    if (msg !== '') {
      genericTableFormErrors = genericTableFormErrors.concat({
        name: this.EntityPropertyName.MONTANT_TRESORERIE,
        message: msg
      });
    }
    return genericTableFormErrors;
  }

  /**
   * Vérifier le format de chaque champ de l'entité famille
   * @param entity
   */
  public handleFormErrors(entity: Famille): GenericTableFormError[] {
    let genericTableFormErrors: GenericTableFormError[] = [];
    genericTableFormErrors = this.getDateFormError(entity.date_creation, genericTableFormErrors);
    genericTableFormErrors = this.getMembresFormError(entity.membres, genericTableFormErrors);
    genericTableFormErrors = this.getOrigineFormError(entity.origine, genericTableFormErrors);
    genericTableFormErrors = this.getMontantTresorerieFormError(entity.montant_tresorerie, genericTableFormErrors);
    return genericTableFormErrors.length > 0 ? genericTableFormErrors : undefined;
  }

  /**
   * Gérer la création: vérifier le format de l'entité famille, appeler l'api pour la création, vérifier les erreurs retournées par l'api
   * @param entity
   */
  public creation(entity: Famille): GenericTableEntityErrors {
    const formErrors = this.handleFormErrors(entity);
    let apiError: string;
    if (!formErrors){
      const familleResponseDummy: FamilleResponseDummy = this.genericTableDemoService.createFamille(entity);
      if (familleResponseDummy.status !== 200) {
        apiError = familleResponseDummy.messageError;
      }
    }
    return {
      formErrors,
      apiError
    };
  }

  /**
   * Gérer l'édition: vérifier le format de l'entité famille, appeler l'api pour l'édition, vérifier les erreurs retournées par l'api
   * @param entity
   */
  public edit(entity: Famille): GenericTableEntityErrors {
    const formErrors = this.handleFormErrors(entity);
    let apiError: string;
    if (!formErrors){
      const familleResponseDummy: FamilleResponseDummy = this.genericTableDemoService.editFamille(entity);
      if (familleResponseDummy.status !== 200) {
        apiError = familleResponseDummy.messageError;
      }
    }
    return {
      formErrors,
      apiError
    };
  }

  /**
   * Gérer la suppression: vérifier le format de l'entité famille,
   * appeler l'api pour la suppression, vérifier les erreurs retournées par l'api
   * @param entity
   */
  public delete(entity: Famille): GenericTableEntityErrors {
    const formErrors = this.handleFormErrors(entity);
    let apiError: string;
    if (!formErrors){
      const familleResponseDummy: FamilleResponseDummy = this.genericTableDemoService.deleteEFamille(entity);
      if (familleResponseDummy.status !== 200) {
        apiError = familleResponseDummy.messageError;
      }
    }
    return {
      formErrors,
      apiError
    };
  }

  /**
   * Gérer la sélection d'une entité
   * @param entity
   */
  public onSelect(genericTableEntityEvent: GenericTableEntityEvent<Famille>): void {
    console.log('Entity selected: ', genericTableEntityEvent.entity);
  }
}
