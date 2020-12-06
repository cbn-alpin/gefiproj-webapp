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
  entitySelectBoxOptions?: EntitySelectBoxOptions[];

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
}
