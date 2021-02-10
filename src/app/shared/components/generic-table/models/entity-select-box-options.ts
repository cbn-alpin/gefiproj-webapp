import { SelectBoxOption } from './SelectBoxOption';

export interface EntitySelectBoxOptions<T> {
  /**
   * Nom de la propriété ciblée.
   */
  name: string;
  values: SelectBoxOption<T>[];
}
