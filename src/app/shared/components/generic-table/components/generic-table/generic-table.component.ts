import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Financement, Statut_F } from 'src/app/models/financement';
import { GenericTableAction } from '../../globals/generic-table-action';
import { GenericTableCellType } from '../../globals/generic-table-cell-types';
import { GenericTableEntityState } from '../../globals/generic-table-entity-states';
import { EntityType } from '../../models/entity-types';
import {
  GenericTableEntity,
  GenericTableEntityErrors,
  GenericTableFormError,
  HistoryOfEntityUpdating
} from '../../models/generic-table-entity';
import { GenericTableEntityEvent } from '../../models/generic-table-entity-event';
import { GenericTableOptions } from '../../models/generic-table-options';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import { SelectBoxOption } from '../../models/SelectBoxOption';
import { SortInfo } from '../../models/sortInfo';

@Component({
  selector: 'app-generic-table[title][options]',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
})
export class GenericTableComponent<T> implements OnInit, AfterViewInit {
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

  /**
   * Indique si les éléments affichés sont en lecture seule (=pas de modification possible si à 'true').
   */
  @Input() isReadOnly = false;

  @Input() title: string;
  @Input() showActions = true;
  @Input() canSelect = false;
  @Input() getEntityInformationsCallBack: Function = () => "";
  @Output() editEvent: EventEmitter<GenericTableEntityEvent<T>> = new EventEmitter<GenericTableEntityEvent<T>>();
  @Output() createEvent: EventEmitter<GenericTableEntityEvent<T>> = new EventEmitter<GenericTableEntityEvent<T>>();
  @Output() deleteEvent: EventEmitter<GenericTableEntityEvent<T>> = new EventEmitter<GenericTableEntityEvent<T>>();
  @Output() selectEvent: EventEmitter<GenericTableEntityEvent<T>> = new EventEmitter<GenericTableEntityEvent<T>>();

  /**
   * Notifie le composant parent que le trie a changé.
   */
  @Output() sortEvent = new EventEmitter<SortInfo>();

  /**
   * Récupère le trie courant.
   */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Indique le titre de la colonne à trier.
   */
  public get sortName(): string {
    return this._options?.sortName || '';
  }

  /**
   * Indique le sens du trie.
   */
  public get sortDirection(): SortDirection {
    return this._options?.sortDirection || 'asc';
  }

  public genericTableData: GenericTableEntity<T>[];
  public dataSourceColumnsName: EntityType[];
  public displayedColumns: string[];
  public actionsHeaderColumns = 'Actions';
  public GenericTableEntityState = GenericTableEntityState;
  public historyOfEntitiesUpdating: HistoryOfEntityUpdating<T>[] = [];
  public selectedEntity: GenericTableEntity<T>;
  public canSelectSelectedEntity: boolean = true;
  private genericTableAction: GenericTableAction;

  /**
   * Retourne les données de la table.
   */
  public get dataObservable(): T[] {
    return this.genericTableData
      ?.map(gd => gd.data) || [];
  }

  /**
   * Indique que la table est vide.
   */
  public get isEmpty(): boolean {
    return this.genericTableData.length === 0;
  }

  /**
   * Indique si une navigation est prévue.
   */
  public get withNagivation(): boolean {
    return !!this._options?.navigationUrlFt;
  }

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  /**
   * Initialise le composant.
   */
  ngOnInit(): void {
    try {
      this.initTable();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Déclenché quand tous les composants sont chargés.
   */
  ngAfterViewInit(): void {
    try {
      this.sort.active = this._options?.sortName || '';
      this.sort.direction = this._options?.sortDirection || 'asc';
      this.onSortChange();

      this.initEvents();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Indique si le trie est désactivé pour la propriété indiquée.
   * @param propertyName : nom de la propriété ciblée.
   */
  public isSortDisabled(propertyName: string): boolean {
    try {
      const sortEnabled = this._options.entityTypes
        .find(t => t.code === propertyName)
        ?.sortEnabled;

      return !sortEnabled;
    } catch (error) {
      console.error(error);
      return true;
    }
  }

  /**
   * Notification d'un changement sur le trie.
   */
  private onSortChange(): void {
    try {
      const name = this._options.entityTypes // Pour récupérer le nom de la propriété
        .find(t => t.name === this.sort.active)
        ?.code
        || this.sort.active;
      const sort: SortInfo = { // Information sur le trie
        name,
        direction: this.sort.direction
      };

      this.sortEvent.emit(sort);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Initialise les branchements aux évènements des composants fils.
   */
  private initEvents(): void {
    try {
      this.sort.sortChange.subscribe(() =>
        this.onSortChange());
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Initialise le tableau.
   */
  private initTable(): void {
    this.selectedEntity = undefined;
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
    return this.options.entityTypes.map(res => res.name);
  }

  public getColumnName(value: string): string {
    const columnNameSplice = value.split('_');
    let columnName = columnNameSplice.join(' ');
    columnName = columnName[0].toUpperCase() + columnName.substr(1);
    return columnName;
  }

  public onEdit(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.selectedEntity = entity;
    const entitySelected = JSON.parse(JSON.stringify(entity));
    const history: HistoryOfEntityUpdating<T> = {
      previous: entitySelected,
      next: entity
    };
    this.historyOfEntitiesUpdating = this.historyOfEntitiesUpdating.concat(history);
    entity.state = GenericTableEntityState.EDIT;
  }

  public edit(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.genericTableAction = GenericTableAction.EDIT;
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableData.map((row) => row.data),
      callBack: (genericTableEntityErrors?: GenericTableEntityErrors) => this.handleErrors(entity, genericTableEntityErrors)
    };
    this.editEvent.emit(genericTableEntityEvent);
  }

  /**
   * Lorsqu'on annule l'édition d'une ligne il faut retrouver l'ancienne valeur de la ligne, mettre à jour l'historique et nettoyer les erreurs.
   * @
   */
  public cancelEditing(event, entity: GenericTableEntity<T>): void {
        event.stopPropagation();
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
    this.selectedEntity = newElement;
    this.genericTableData = [newElement].concat(this.genericTableData);
  }

  public create(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.genericTableAction = GenericTableAction.NEW;
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableData.map((row) => row.data),
      callBack: (genericTableEntityErrors?: GenericTableEntityErrors) => this.handleErrors(entity, genericTableEntityErrors)
    };
    this.createEvent.emit(genericTableEntityEvent);
  }

  public cancelCreation(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
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
      ?.find((entity) => entity.code === entityName)
      .type === GenericTableCellType.TEXT;
  }

  public isTextarea(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.code === entityName)
      .type === GenericTableCellType.TEXTAREA;
  }

  public isNumber(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.code === entityName)
      .type === GenericTableCellType.NUMBER;
  }

  public isBoolean(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.code === entityName)
      .type === GenericTableCellType.BOOLEAN;
  }

  public isDate(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.code === entityName)
      .type === GenericTableCellType.DATE;
  }

  public isCurrency(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.code === entityName)
      .type === GenericTableCellType.CURRENCY;
  }

  public isSelectBox(entityName: any): boolean {
    return this.options.entityTypes
      ?.find((entity) => entity.code === entityName)
      .type === GenericTableCellType.SELECTBOX;
  }

  public getEntitySelectBoxOptions(entityName: string): SelectBoxOption<any>[] {
    return this.options.entitySelectBoxOptions
      ?.find((entity) => entity.name === entityName)
      .values || [];
  }

  public getDateValue(dateString: string): Date {
    return new Date(dateString);
  }

  public getErrorMessage(errors: GenericTableFormError[], name: string): string {
    return errors
      ?.find((error) => error.name === name)
      ?.message;
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
      this.cleanErrors(entity);
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
      ?.find((entityPlaceHolder) => entityPlaceHolder.name === name)
      ?.value || '';
  }

  private openApiErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  /**
   * Lorsqu'une entité est sélectionné dans le tableau, on émet un événement avec l'entité en paramètre
   * @param genericTableEntity : décrit l'élément sélectionné.
   */
  public select(genericTableEntity: GenericTableEntity<T>): void {
    if (genericTableEntity.state === GenericTableEntityState.READ) {
      this.selectedEntity = genericTableEntity;
      const genericTableEntityEvent: GenericTableEntityEvent<T> = {
        entity: genericTableEntity.data
      };
      this.selectEvent.emit(genericTableEntityEvent);
    }
  }

  /**
   * Retourne la taille des lignes du tableau
   */
  public getResult(){
    const nbResults = this.genericTableData.length;
    return nbResults + (nbResults > 1 ? ' résultats' : ' résultat');
  }

  /**
   * bloque la modification de certain champs
   * @param entity : l'object à modifié
   * @param entityName : nom de l'entité de l'object
   */
  public disabledEditField(entity: GenericTableEntity<T>, entityName: string): Boolean{
    const selectedEntity = entity.data;
    let disabled = false;
    // exception edition pour l'instance financement
    if (this.instanceOfFinancement(selectedEntity)) {
      if (selectedEntity?.solde && entityName !== 'statut_f') {
        disabled = true;
      } else if (entityName === 'difference') {
        disabled = true;
      } else {
        disabled = false;
      }
    }
    return disabled;
  }

  /**
   * Retourne vrai si T est de l'instance financement
   * @param object : l'objet data de l'entity
   */
  public instanceOfFinancement(object: any): object is Financement {
    return true;
  }


  public openDeletionConfirmationDialog(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(DialogDeletionConfirmation, {
      width: '300px',
      data: {
        event,
        entity,
        entityInformations: this.getEntityInformationsCallBack(entity.data)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.delete(result.entity);
      }
    });
  }

  /**
   * Lance une navigation vers l'URL indiquée.
   * @param entity : encapsule l'élément métier à l'origine de la navigation.
   */
  public onNavigate(entity: GenericTableEntity<T>): void {
    try {
      const item = entity?.data;
      const ft = this._options?.navigationUrlFt;

      if (item && ft) {
        const url = ft(item);

        if (url) {
          this.router.navigate([
            url
          ]);
          return;
        }
      }

      throw new Error(
        'Navigation impossible car les éléments de navigation sont inutilisables');
    } catch (error) {
      console.error(error);
      this.openApiErrorSnackBar('Navigation impossible');
    }
  }
}

@Component({
  selector: 'deletion-confirmation-dialog',
  templateUrl: '../deletion-confirmation-dialog/deletion-confirmation-dialog.html',
  styleUrls: ['../deletion-confirmation-dialog/deletion-confirmation-dialog.scss']

})
export class DialogDeletionConfirmation<T> {

  constructor(
    public dialogRef: MatDialogRef<DialogDeletionConfirmation<T>>,
    @Inject(MAT_DIALOG_DATA) public data: DeletionConfirmationDialogData<T>) {}

  public validation(): void {
    this.dialogRef.close(this.data);
  }

  public cancellation(): void {
    this.dialogRef.close(undefined);
  }

}

interface DeletionConfirmationDialogData<T> {
  event: any;
  entity: GenericTableEntity<T>;
  entityInformations: string;
}
