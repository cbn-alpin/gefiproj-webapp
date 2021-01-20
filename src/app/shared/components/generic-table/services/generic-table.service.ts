import { Injectable } from '@angular/core';
import { Financement } from '../../../../models/financement';
import { GenericTableEntity } from '../models/generic-table-entity';
import { SelectBoxOption } from '../models/SelectBoxOption';
import { GenericTableOptions } from '../models/generic-table-options';
import { GenericTableEntityState } from '../globals/generic-table-entity-states';

@Injectable({
  providedIn: 'root',
})
export class GenericTableService<T> {
  constructor() {}

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
  public getResult(genericTableData: GenericTableEntity<T>[]): string {
    const nbResults = genericTableData.length;
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
      ).values || []
    );
  }

  public getDateValue(dateString: string): Date {
    return new Date(dateString);
  }
}
