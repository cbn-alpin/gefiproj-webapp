import { GenericTableEntityErrors } from './generic-table-entity';

export interface GenericTableEntityEvent<T> {
  entity: T;
  // S'il y a une erreur alors l'état de l'entité est inchangé sinon l'entité passe en mode lecture (READ)
  callBack?: (genericTableEntityErrors?: GenericTableEntityErrors) => any;
}
