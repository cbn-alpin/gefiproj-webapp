import { GenericTableEntityState } from '../globals/generic-table-entity-states';

export interface GenericTableEntity<T> {
  data: T;
  state: GenericTableEntityState;
  errors?: GenericTableFormError[];
  id?: number;
}

export interface GenericTableFormError {
  name: string;
  message: string;
}

export interface GenericTableEntityErrors {
  // Error in form like invalid format
  formErrors?: GenericTableFormError[];
  // Api error like call api success 200 or error 400 (server back is dead) or code project is already used
  apiError?: string;
}
