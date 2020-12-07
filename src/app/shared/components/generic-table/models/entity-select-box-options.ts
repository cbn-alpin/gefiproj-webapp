import { SelectBoxOption } from './SelectBoxOption';

export interface EntitySelectBoxOptions<T> {
  name: string;
  values: SelectBoxOption<T>[];
}
