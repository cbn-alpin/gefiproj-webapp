import { Injectable } from '@angular/core';
import {
  GenericTableEntity,
  GenericTableEntityErrors,
  GenericTableFormError,
} from '../models/generic-table-entity';
import { GenericTableEntityState } from '../globals/generic-table-entity-states';
import { PopupService } from '../../../services/popup.service';

@Injectable({
  providedIn: 'root',
})
export class GenericTableErrorService<T> {
  constructor(private readonly popupService: PopupService) {}

  public getErrorMessage(
    errors: GenericTableFormError[],
    name: string
  ): string {
    return errors?.find((error) => error.name === name)?.message;
  }

  public hasErrors(entity: GenericTableEntity<T>, name: string): boolean {
    return (
      entity.errors?.find((error) => error.name === name) !== undefined &&
      (entity.state === GenericTableEntityState.EDIT ||
        entity.state === GenericTableEntityState.NEW)
    );
  }

  public cleanErrors(entity: GenericTableEntity<T>): void {
    entity.errors = [];
  }

  public handleErrors(
    entity: GenericTableEntity<T>,
    genericTableEntityErrors: GenericTableEntityErrors
  ): boolean {
    let canDoAction = false;
    const hasFormErrors = this.hasFormErrors(entity, genericTableEntityErrors);
    if (!hasFormErrors) {
      this.cleanErrors(entity);
      const hasBusinessErrors = this.hasBusinessErrors(
        entity,
        genericTableEntityErrors
      );
      if (!hasBusinessErrors) {
        const hasApiErrors = this.hasApiErrors(genericTableEntityErrors);
        if (!hasApiErrors) {
          canDoAction = true;
        }
      }
    }
    return canDoAction;
  }

  private hasFormErrors(
    entity: GenericTableEntity<T>,
    genericTableEntityErrors: GenericTableEntityErrors
  ): boolean {
    if (genericTableEntityErrors?.formErrors?.length > 0) {
      entity.errors = genericTableEntityErrors.formErrors;
      return true;
    }
    return false;
  }

  private hasBusinessErrors(
    entity: GenericTableEntity<T>,
    genericTableEntityErrors: GenericTableEntityErrors
  ): boolean {
    if (genericTableEntityErrors?.businessErrors?.length > 0) {
      entity.errors = genericTableEntityErrors.businessErrors;
      return true;
    }
    return false;
  }

  private hasApiErrors(
    genericTableEntityErrors: GenericTableEntityErrors
  ): boolean {
    if (genericTableEntityErrors?.apiError) {
      this.popupService.openErrorPopup(genericTableEntityErrors.apiError);
      return true;
    }
    return false;
  }
}
