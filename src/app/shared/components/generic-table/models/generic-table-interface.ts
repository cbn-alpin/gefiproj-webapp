import {GenericTableOptions} from './generic-table-options';
import {GenericTableEntityEvent} from './generic-table-entity-event';
import {GenericTableEntityErrors, GenericTableFormError} from './generic-table-entity';

export interface GenericTableInterface<T> {
  /**
   * Options du tableau générique: données sources, entité par défaut, types des entités, les options des select box, les placeholders
   */
  options: GenericTableOptions<T>;

  /**
   * Lorsque l'événement d'édition est reçu, vérifier les erreurs de format puis modifier
   */
  onEdit?: (genericTableEntityEvent: GenericTableEntityEvent<T>) => any;

  /**
   * Lorsque l'événement de supression est reçu, vérifier les erreurs de format puis supprimer
   */
  onDelete?: (genericTableEntityEvent: GenericTableEntityEvent<T>) => any;

  /**
   * Lorsque l'événement de création est reçu, vérifier les erreurs de format puis créer
   */
  onCreate?: (genericTableEntityEvent: GenericTableEntityEvent<T>) => any;

  /**
   * Vérifier le format de chaque champ de l'entité famille
   */
  handleFormErrors?: (entity: T) => GenericTableFormError[];

  /**
   * Gérer l'édition: vérifier le format de l'entité famille, appeler l'api pour l'édition, vérifier les erreurs retournées par l'api
   */
  edit?: (entity: T) => GenericTableEntityErrors;

  /**
   * Gérer la création: vérifier le format de l'entité famille, appeler l'api pour la création, vérifier les erreurs retournées par l'api
   */
  creation?: (entity: T) => GenericTableEntityErrors;

  /**
   * Gérer la suppression: vérifier le format de l'entité famille, appeler l'api pour la suppression, vérifier les erreurs retournées par l'api
   */
  delete?: (entity: T) => GenericTableEntityErrors;
}
