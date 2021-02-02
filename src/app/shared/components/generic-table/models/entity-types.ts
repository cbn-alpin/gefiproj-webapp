import { GenericTableCellType } from '../globals/generic-table-cell-types';

export interface EntityType {
  /**
   * Titre de la colonne.
   */
  name: string;

  /**
   * Type de la donnée.
   */
  type: GenericTableCellType;

  /**
   * Nom de la propriété ciblée.
   */
  code?: string;

  /**
   * Indique si le trie doit être possible sur cet élément.
   */
  sortEnabled?: boolean;

  /**
   * Indique si la colonne n'est pas éditable
   */
  disableEditing?: boolean;
}
