import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenericTableAction } from '../../globals/generic-table-action';
import { GenericTableCellType } from '../../globals/generic-table-cell-types';
import { GenericTableEntityState } from '../../globals/generic-table-entity-states';
import {
  GenericTableEntity,
  GenericTableEntityErrors,
  GenericTableFormError,
  HistoryOfEntityUpdating
} from '../../models/generic-table-entity';
import { GenericTableEntityEvent } from '../../models/generic-table-entity-event';
import { GenericTableOptions } from '../../models/generic-table-options';
import { EntityPlaceholder } from '../../models/entity-placeholder';
import { EntityType } from '../../models/entity-types';

@Component({
  selector: 'app-generic-table[title][options]',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss']
})
export class GenericTableComponent<T> implements OnInit {
  /**
   * Défini les données à afficher et leur formatage.
   */
  // tslint:disable-next-line: variable-name
  private _options: GenericTableOptions<T>;
  /**
   * Fourni le paramétrage d'affichage et les données du tableau.
   */
  get options(): GenericTableOptions<T> {
    return this._options;
  }
  /**
   * Défini le paramétrage d'affichage et les données du tableau.
   */
  @Input() set options(opt: GenericTableOptions<T>) {
    try {
      if (opt) {
        this._options = opt;
        this.initTable();
      }
    } catch (error) {
      console.error(error);
    }
  }
  @Input() title: string;
  @Input() showActions = true;
  @Output() editEvent: EventEmitter<GenericTableEntityEvent<T>> = new EventEmitter<GenericTableEntityEvent<T>>();
  @Output() createEvent: EventEmitter<GenericTableEntityEvent<T>> = new EventEmitter<GenericTableEntityEvent<T>>();
  @Output() deleteEvent: EventEmitter<GenericTableEntityEvent<T>> = new EventEmitter<GenericTableEntityEvent<T>>();

  public genericTableData: GenericTableEntity<T>[];
  public dataSourceColumnsName: EntityType[];
  public displayedColumns: string[];
  public actionsHeaderColumns = 'Actions';
  public GenericTableEntityState = GenericTableEntityState;
  public historyOfEntitiesUpdating: HistoryOfEntityUpdating<T>[] = [];
  private genericTableAction: GenericTableAction;

  constructor(
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initTable();
  }

  /**
   * Initialise le tableau.
   */
  private initTable(): void {
    try {
    this.genericTableData = this.options.dataSource?.map((entity) => {
      return {
        data: entity,
        state: GenericTableEntityState.READ
      };
    });
    this.dataSourceColumnsName = this.options.entityTypes;
    this.displayedColumns = this.showActions 
      ? this.getDisplayedColumns().concat(this.actionsHeaderColumns) 
      : this.getDisplayedColumns();
    } catch (error) {
      console.error(error);
    }
  }
  
  public getDisplayedName(): string[] {
    return this.options.entityPlaceHolders.map(res => res.name);
  }
  public getDisplayedColumns(): string[] {
    return this.options.entityTypes.map(res => res.code);
  }

  public getColumnName(value: string): string {
    const columnNameSplice = value.split('_');
    let columnName = columnNameSplice.join(' ');
    columnName = columnName[0].toUpperCase() + columnName.substr(1);
    return columnName;
  }

  public onEdit(entity: GenericTableEntity<T>): void {
    const entitySelected = JSON.parse(JSON.stringify(entity));
    const history: HistoryOfEntityUpdating<T> = {
      previous: entitySelected,
      next: entity
    };
    this.historyOfEntitiesUpdating = this.historyOfEntitiesUpdating.concat(history);
    entity.state = GenericTableEntityState.EDIT;
  }

  public edit(entity: GenericTableEntity<T>): void {
    this.genericTableAction = GenericTableAction.EDIT;
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableData.map((data) => data.data),
      callBack: (genericTableEntityErrors?: GenericTableEntityErrors) => this.handleErrors(entity, genericTableEntityErrors)
    };
    this.editEvent.emit(genericTableEntityEvent);
  }

  public cancelEditing(entity: GenericTableEntity<T>): void {
    const previousValue = this.historyOfEntitiesUpdating?.find((history) => history.next === entity).previous;
    entity.data = previousValue.data;
    entity.state = GenericTableEntityState.READ;
    this.historyOfEntitiesUpdating = this.historyOfEntitiesUpdating?.filter((history) => history.next !== entity);
    this.cleanErrors(entity);
  }

  public onCreate(): void {
    this.genericTableAction = GenericTableAction.NEW;
    const defaultEntity = JSON.parse(JSON.stringify(this.options.defaultEntity));
    const newElement: GenericTableEntity<T> = {
      data: defaultEntity,
      state: GenericTableEntityState.NEW
    };
    this.genericTableData = [newElement].concat(this.genericTableData);
  }

  public create(entity: GenericTableEntity<T>): void {
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableData.map((data) => data.data),
      callBack: (genericTableEntityErrors?: GenericTableEntityErrors) => this.handleErrors(entity, genericTableEntityErrors)
    };
    this.createEvent.emit(genericTableEntityEvent);
  }

  public cancelCreation(entity: GenericTableEntity<T>): void {
    this.genericTableData = this.genericTableData?.filter((data) => entity.data !== data.data);
  }

  public canCreate(): boolean {
    return this.genericTableData?.find((data) => data.state === GenericTableEntityState.NEW) !== undefined;
  }

  public delete(entity: GenericTableEntity<T>): void {
    this.genericTableAction = GenericTableAction.DELETE;
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableData.map((data) => data.data),
      callBack: (genericTableEntityErrors?: GenericTableEntityErrors) => this.handleErrors(entity, genericTableEntityErrors)
    };
    this.deleteEvent.emit(genericTableEntityEvent);
  }

  public isString(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.name === entityName)
      .type === GenericTableCellType.TEXT;
  }

  public isNumber(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.name === entityName)
      .type === GenericTableCellType.NUMBER;
  }

  public isBoolean(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.name === entityName)
      .type === GenericTableCellType.BOOLEAN;
  }

  public isDate(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.name === entityName).type === GenericTableCellType.DATE;
  }

  public isCurrency(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.name === entityName)
      .type === GenericTableCellType.CURRENCY;
  }

  public isSelectBox(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.name === entityName)
      .type === GenericTableCellType.SELECTBOX;
  }

  public getEntitySelectBoxOptions(entityName: string): string[] {
    return this.options.entitySelectBoxOptions
      ?.find((entity) => entity.name === entityName)
      .values || [];
  }

  public getDateValue(dateString: string): Date {
    return new Date(dateString);
  }

  public getErrorMessage(errors: GenericTableFormError[], name: string): string {
    return errors?.find((error) => error.name === name)?.message;
  }

  public hasErrors(entity: GenericTableEntity<T>, name: string): boolean {
    return entity.errors?.find((error) => error.name === name) !== undefined
      && (entity.state === GenericTableEntityState.EDIT || entity.state === GenericTableEntityState.NEW);
  }

  public cleanErrors(entity: GenericTableEntity<T>): void {
    entity.errors = [];
  }

  public handleFormErrors(entity: GenericTableEntity<T>, genericTableEntityErrors: GenericTableEntityErrors): boolean {
    if (genericTableEntityErrors?.formErrors?.length > 0) {
      entity.errors = genericTableEntityErrors.formErrors;
      return true;
    }
    return false;
  }

  public handleBusinessErrors(entity: GenericTableEntity<T>, genericTableEntityErrors: GenericTableEntityErrors): boolean {
    if (genericTableEntityErrors?.businessErrors?.length > 0) {
      entity.errors = genericTableEntityErrors.businessErrors;
      return true;
    }
    return false;
  }

  public handleApiErrors(entity: GenericTableEntity<T>, genericTableEntityErrors: GenericTableEntityErrors): boolean {
    if (genericTableEntityErrors?.apiError) {
      this.openApiErrorSnackBar(genericTableEntityErrors.apiError);
      return true;
    }
    return false;
  }

  public handleErrors(entity: GenericTableEntity<T>, genericTableEntityErrors: GenericTableEntityErrors): void {
    const hasFormErrors = this.handleFormErrors(entity, genericTableEntityErrors);
    if (!hasFormErrors) {
      const hasBusinessErrors = this.handleBusinessErrors(entity, genericTableEntityErrors);
      if (!hasBusinessErrors) {
        const hasApiErrors = this.handleApiErrors(entity, genericTableEntityErrors);
        if (!hasApiErrors) {
          this.handleAction(entity);
        }
      }
    }
  }

  public handleAction(entity: GenericTableEntity<T>): void {
    if (this.genericTableAction === GenericTableAction.EDIT) {
      this.handleActionEdit(entity);
    } else if (this.genericTableAction === GenericTableAction.NEW) {
      this.handleActionNew(entity);
    } else if (this.genericTableAction === GenericTableAction.DELETE) {
      this.handleActionDelete(entity);
    }
  }

  public handleActionEdit(entity: GenericTableEntity<T>): void {
    entity.errors = [];
    entity.state = GenericTableEntityState.READ;
    this.historyOfEntitiesUpdating = this.historyOfEntitiesUpdating?.filter((history) => history.next !== entity);
  }

  public handleActionNew(entity: GenericTableEntity<T>): void {
    entity.errors = [];
    entity.state = GenericTableEntityState.READ;
    this.historyOfEntitiesUpdating = this.historyOfEntitiesUpdating?.filter((history) => history.next !== entity);
  }

  public handleActionDelete(entity: GenericTableEntity<T>): void {
    this.genericTableData = this.genericTableData
      ?.filter((data) => entity.data !== data.data);
  }

  public getPlaceHolder(name: string): string {
    return this.options.entityPlaceHolders
      ?.find((entityPlaceHolder) => entityPlaceHolder.name === name)?.value || '';
  }

  private openApiErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
