import { GenericTableEntityState } from '../globals/generic-table-entity-states';

export interface GenericTableEntity<T> {
    data: T;
    state: GenericTableEntityState;
    errors?: GenericTableFormError[];
}

export interface HistoryOfEntityUpdating<T> {
    previous: GenericTableEntity<T>;
    next: GenericTableEntity<T>;
}

export interface GenericTableFormError {
    name: string;
    message: string;
}

export interface GenericTableBusinessError {
  name: string;
  message: string;
}

export interface GenericTableEntityErrors {
    // Error in form like invalid format
    formErrors?: GenericTableFormError[];
    // Business error like code project is already used
    businessErrors?: GenericTableBusinessError[];
    // Api error like call api success 200 or error 400 (server back is dead)
    apiError?: string;
}
