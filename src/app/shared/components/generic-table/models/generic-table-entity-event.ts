import {GenericTableEntityErrors} from './generic-table-entity';

export interface GenericTableEntityEvent<T> {
    entity: T;
    updatedGenericTable: T[];
    callBack: (genericTableEntityErrors?: GenericTableEntityErrors) => any;
}
