import { SortDirection } from '@angular/material/sort';
import { EntitySelectBoxOptions } from './entity-select-box-options';
import { EntityType } from './entity-types';
import { EntityPlaceholder } from './entity-placeholder';

export interface GenericTableOptions<T> {
  /**
   * Tableau des entités T.
   */
  dataSource: T[];

  /**
   * Entité par défaut utilisé lors de la création d'une nouvelle entité T.
   */
  defaultEntity: T;

  /**
   * Tableau des types de l'entité T.
   */
  entityTypes: EntityType[];

  /**
   * Tableau des options pour chaque select box de l'entité T.
   */
  entitySelectBoxOptions?: EntitySelectBoxOptions<any>[];

  /**
   * Tableau des placeholders de l'entité T.
   */
  entityPlaceHolders?: EntityPlaceholder[];

  /**
   * Titre de la colonne à trier.
   */
  sortName?: string;

  /**
   * Sens du trie.
   */
  sortDirection?: SortDirection;

  /**
   * Indique un lien de navigation. Il faut définir un callback retournant une URL.
   */
  navigationUrlFt?: (item: T) => string;

  /**
   * Indique si l'item est en lecture seule.
   * Note : cela n'empêche pas la suppression.
   */
  readOnlyFt?: (item: T) => boolean;

  /**
   * Indique si la colonne (correspondante à la propriété en paramètre) de l'item est en lecture seule.
   */
  readOnlyPropertyFt?: (item: T, propertyName: string) => boolean;
}
