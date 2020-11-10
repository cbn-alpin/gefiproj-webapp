import { GenericTableCellType } from '../globals/generic-table-cell-types';

export interface EntityType {
  name: string;
  type: GenericTableCellType;
  code?: string;
}
