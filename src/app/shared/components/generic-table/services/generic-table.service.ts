import { Injectable } from '@angular/core';
import { Financement } from '../../../../models/financement';
import { GenericTableEntity } from '../models/generic-table-entity';
import { SelectBoxOption } from '../models/SelectBoxOption';
import { GenericTableOptions } from '../models/generic-table-options';
import { GenericTableEntityState } from '../globals/generic-table-entity-states';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
import { getDeepCopy } from '../../../tools/utils';
import { EntityType } from '../models/entity-types';

@Injectable({
  providedIn: 'root',
})
export class GenericTableService<T> {
  constructor(private adminSrv: IsAdministratorGuardService) {}

  /**
   * Indique si l'utilisateur est un administrateur.
   */
  public get isAdministrator(): boolean {
    return this.adminSrv.isAdministrator();
  }

  public getDisplayedName(options: GenericTableOptions<T>): string[] {
    return options.entityPlaceHolders.map((res) => res.name);
  }

  public getDisplayedColumns(options: GenericTableOptions<T>): string[] {
    return options.entityTypes.map((res) => res.name);
  }

  public canCreate(genericTableData: GenericTableEntity<T>[]): boolean {
    return (
      genericTableData?.find(
        (data) => data.state === GenericTableEntityState.NEW
      ) !== undefined
    );
  }

  public getPlaceHolder(options: GenericTableOptions<T>, name: string): string {
    return (
      options.entityPlaceHolders?.find(
        (entityPlaceHolder) => entityPlaceHolder.name === name
      )?.value || ''
    );
  }

  /**
   * Retourne vrai si T est de l'instance financement
   * @param object : l'objet data de l'entity
   */
  public instanceOfFinancement(object: any): object is Financement {
    return true;
  }

  /**
   * Retourne la taille des lignes du tableau
   */
  public getResult(genericTableEntities: GenericTableEntity<T>[]): string {
    const nbResults = genericTableEntities.filter(
      (genericTableEntity) =>
        genericTableEntity.state !== GenericTableEntityState.NEW
    ).length;
    return nbResults + (nbResults > 1 ? ' résultats' : ' résultat');
  }

  /**
   * Indique si le trie est désactivé pour la propriété indiquée.
   * @param options
   * @param propertyName
   */
  public isSortDisabled(
    options: GenericTableOptions<T>,
    propertyName: string
  ): boolean {
    try {
      const sortEnabled = options.entityTypes.find(
        (t) => t.code === propertyName
      )?.sortEnabled;

      return !sortEnabled;
    } catch (error) {
      console.error(error);
      return true;
    }
  }

  public getEntitySelectBoxOptions(
    options: GenericTableOptions<T>,
    entityName: string
  ): SelectBoxOption<any>[] {
    return (
      options.entitySelectBoxOptions?.find(
        (entity) => entity.name === entityName
      )?.values || []
    );
  }

  public getDateValue(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   *
   * @param genericTableEntities
   * @param genericTableEntitiesCopy
   * @param entityKeep
   */
  public getOtherEntitiesReseted(
    genericTableEntities: GenericTableEntity<T>[],
    genericTableEntitiesCopy: GenericTableEntity<T>[],
    entityKeep?: GenericTableEntity<T>
  ): GenericTableEntity<T>[] {
    const entities = genericTableEntities.map((entity) => {
      if (
        (entityKeep &&
          entity.id !== entityKeep.id &&
          entity.state === GenericTableEntityState.EDIT) ||
        (!entityKeep && entity.state === GenericTableEntityState.EDIT)
      ) {
        const entityToCopy = genericTableEntitiesCopy.find(
          (entityCopy) => entityCopy.id === entity.id
        );
        entity = getDeepCopy(entityToCopy);
      }

      if (entity.state === GenericTableEntityState.NEW) {
        entity = null;
      }
      return entity;
    });

    return entities;
  }

  /**
   * bloque la modification de certain champs
   * @param entity : l'object à modifié
   * @param entityType : données lié au type de l'entité
   */
  public disabledEditField(
    entity: GenericTableEntity<T>,
    entityType: EntityType
  ): boolean {
    let disabled: boolean;
    const _entity = entity.data as any;
    const entityCodeIsStatutOrDateSoldeFinancement =
      entityType.code === 'statut_f' || entityType.code === 'date_solde_f';
    const userHasAdminRightAndFinancementIsBalance =
      this.isAdministrator && _entity.solde;
    if (userHasAdminRightAndFinancementIsBalance) {
      disabled = entityCodeIsStatutOrDateSoldeFinancement ? false : true;
    } else {
      disabled = entityType.disableEditing;
    }

    return disabled;
  }
}
