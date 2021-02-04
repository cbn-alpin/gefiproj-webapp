import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatSort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { GenericTableAction } from '../../globals/generic-table-action';
import { GenericTableEntityState } from '../../globals/generic-table-entity-states';
import { EntityType } from '../../models/entity-types';
import {
  GenericTableEntity,
  GenericTableEntityErrors,
} from '../../models/generic-table-entity';
import { GenericTableEntityEvent } from '../../models/generic-table-entity-event';
import { GenericTableOptions } from '../../models/generic-table-options';
import { SortInfo } from '../../models/sortInfo';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GenericTableService } from '../../services/generic-table.service';
import { GenericTableErrorService } from '../../services/generic-table-error.service';
import { GenericTableTypeService } from '../../services/generic-table-type.service';
import { PopupService } from '../../../../services/popup.service';
import { getDeepCopy } from '../../../../tools/utils';

@Component({
  selector: 'app-generic-table[title][options]',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class GenericTableComponent<T>
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
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

  @Input() showDeleteAction = true;

  @Input() canSelect = false;

  @Input() autoSelectFirstRow = false;

  @Input() selectedRow: T;

  @Input() showChangePwdAction = false;

  @Input() showCreateAction: boolean = true;

  @Input() showEditAction: boolean = true;

  @Output() changePwdEvent: EventEmitter<
    GenericTableEntityEvent<T>
    > = new EventEmitter<GenericTableEntityEvent<T>>();

  @Output() editEvent: EventEmitter<
    GenericTableEntityEvent<T>
  > = new EventEmitter<GenericTableEntityEvent<T>>();

  @Output() createEvent: EventEmitter<
    GenericTableEntityEvent<T>
  > = new EventEmitter<GenericTableEntityEvent<T>>();

  @Output() deleteEvent: EventEmitter<
    GenericTableEntityEvent<T>
  > = new EventEmitter<GenericTableEntityEvent<T>>();

  @Output() selectEvent: EventEmitter<
    GenericTableEntityEvent<T>
  > = new EventEmitter<GenericTableEntityEvent<T>>();

  /**
   * Notifie le composant parent que le trie a changé.
   */
  @Output() sortEvent = new EventEmitter<SortInfo>();

  @Output() selectedEntityUpdatedEvent = new EventEmitter<T>();

  @Output() startEditEvent = new EventEmitter<T>();

  /**
   * Récupère le trie courant.
   */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Fourni le paramétrage d'affichage et les données du tableau.
   */
  get options(): GenericTableOptions<T> {
    return this._options;
  }

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

  public genericTableEntities: GenericTableEntity<T>[];

  public entityTypes: EntityType[];

  public displayedColumns: string[];

  public GenericTableEntityState = GenericTableEntityState;

  public canSelectSelectedEntity: boolean = true;

  /**
   * Indique que la table est vide.
   */
  public get isEmpty(): boolean {
    return this.genericTableEntities.length === 0;
  }

  /**
   * Indique si une navigation est prévue.
   */
  public get withNagivation(): boolean {
    return !!this._options?.navigationUrlFt;
  }

  public showMandatoryIcon: boolean;

  /**
   * Copie du tableau.
   * Utile lors de l'annulation de l'édition d'une ligne.
   */
  public genericTableEntitiesCopy: GenericTableEntity<T>[];

  public actionsHeaderColumnName: string = 'Actions';

  public selectedEntity: GenericTableEntity<T>;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  // tslint:disable-next-line: variable-name
  private _options: GenericTableOptions<T>;

  private genericTableAction: GenericTableAction;

  constructor(
    private readonly router: Router,
    private readonly popupService: PopupService,
    public genericTableService: GenericTableService<T>,
    public genericTableErrorService: GenericTableErrorService<T>,
    public genericTableTypeService: GenericTableTypeService<T>
  ) {}

  /**
   * Initialise le composant.
   */
  public ngOnInit(): void {
    try {
      this.initTable();
    } catch (error) {
      console.error(error);
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedRow && changes.selectedRow.currentValue) {
      this.loadSelectedEntity();
    }
    if (
      changes.showActions &&
      changes.showActions.currentValue != null &&
      changes.showActions.previousValue != null
    ) {
      this.resetTable();
      this.loadDisplayedColumns();
    }
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  /**
   * Déclenché quand tous les composants sont chargés.
   */
  public ngAfterViewInit(): void {
    try {
      this.sort.active = this._options?.sortName || '';
      this.sort.direction = this._options?.sortDirection || 'asc';
      this.onSortChange();

      this.initEvents();
    } catch (error) {
      console.error(error);
    }
  }

  public onEdit(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.genericTableAction = GenericTableAction.EDIT;
    this.showMandatoryIcon = true;
    const cleanedGenericTableEntities = this.genericTableService.getOtherEntitiesReseted(
      this.genericTableEntities,
      this.genericTableEntitiesCopy,
      entity
    );
    this.genericTableEntities = cleanedGenericTableEntities.filter(
      (cleanedEntity) => cleanedEntity !== null
    );
    entity.state = GenericTableEntityState.EDIT;
    if (!this.selectedEntity) {
      this.updateSelectedEntity(null);
    }
  }

  public edit(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.genericTableAction = GenericTableAction.EDIT;
    this.showMandatoryIcon = true;
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableEntities.map((row) => row.data),
      callBack: (genericTableEntityErrors?: GenericTableEntityErrors, up?: T) =>
        this.handleAction(entity, genericTableEntityErrors, up),
    };
    this.editEvent.emit(genericTableEntityEvent);
    if (!this.selectedEntity) {
      this.updateSelectedEntity(null);
    }
  }

  public cancelEditing(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.showMandatoryIcon = false;
    const entityToCopy = this.genericTableEntitiesCopy.find(
      (dataCopy) => dataCopy.id === entity.id
    );
    const entityCopied = getDeepCopy(entityToCopy);
    this.genericTableEntities = this.genericTableEntities.map((entity) =>
      entity?.id === entityCopied?.id ? entityCopied : entity
    );
    this.genericTableErrorService.cleanErrors(entity);
    if (!this.selectedEntity) {
      this.updateSelectedEntity(null);
    }
  }

  public onCreate(): void {
    this.genericTableAction = GenericTableAction.NEW;
    this.showMandatoryIcon = true;
    const defaultEntityCopied = getDeepCopy(this.options.defaultEntity);
    const entity: GenericTableEntity<T> = {
      data: defaultEntityCopied,
      state: GenericTableEntityState.NEW,
      id: this.genericTableEntities.length,
    };
    this.genericTableEntities = this.genericTableService.getOtherEntitiesReseted(
      this.genericTableEntities,
      this.genericTableEntitiesCopy
    );
    this.genericTableEntities = [entity].concat(this.genericTableEntities);
    this.updateSelectedEntity(null);
  }

  public create(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.genericTableAction = GenericTableAction.NEW;
    this.showMandatoryIcon = true;
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableEntities.map((row) => row.data),
      callBack: (genericTableEntityErrors?: GenericTableEntityErrors, up?: T) =>
        this.handleAction(entity, genericTableEntityErrors, up),
    };
    this.createEvent.emit(genericTableEntityEvent);
    this.updateSelectedEntity(entity);
  }

  public cancelCreation(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.showMandatoryIcon = false;
    this.genericTableEntities = this.genericTableEntities?.filter(
      (data) => entity.data !== data.data
    );
    this.updateSelectedEntity(null);
  }

  public delete(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.genericTableAction = GenericTableAction.DELETE;
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableEntities.map((data) => data.data),
      callBack: (genericTableEntityErrors: GenericTableEntityErrors) =>
        this.handleAction(entity, genericTableEntityErrors),
    };
    this.deleteEvent.emit(genericTableEntityEvent);
    if (this.selectedEntity && this.selectedEntity.id === entity.id) {
      this.updateSelectedEntity(null);
    }
  }

  public changePwd(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.genericTableAction = GenericTableAction.CHANGEPWD;
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableEntities.map((row) => row.data),
      callBack: (genericTableEntityErrors?: GenericTableEntityErrors, up?: T) =>
        this.handleAction(entity, genericTableEntityErrors, up),
    };
    this.changePwdEvent.emit(genericTableEntityEvent);
  }

  /**
   * Lorsqu'une entité est sélectionné dans le tableau, on émet un événement avec l'entité en paramètre
   * @param entity : l'élément sélectionné.
   */
  public select(entity: GenericTableEntity<T>): void {
    if (
      entity.state === GenericTableEntityState.READ &&
      (!this.selectedEntity || this.selectedEntity.id !== entity.id)
    ) {
      const genericTableEntityEvent: GenericTableEntityEvent<T> = {
        entity: entity.data,
      };
      if (this.canSelect) {
        const cleanedGenericTableEntities = this.genericTableService.getOtherEntitiesReseted(
          this.genericTableEntities,
          this.genericTableEntitiesCopy,
          entity
        );
        this.genericTableEntities = cleanedGenericTableEntities.filter(
          (cleanedEntity) => cleanedEntity !== null
        );
      }
      this.selectEvent.emit(genericTableEntityEvent);
      this.updateSelectedEntity(entity);
    }
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
          this.router.navigate([url]);
          return;
        }
      }

      throw new Error(
        'Navigation impossible car les éléments de navigation sont inutilisables'
      );
    } catch (error) {
      this.popupService.error('Navigation impossible');
    }
  }

  public isSelected(entity: GenericTableEntity<T>): boolean {
    return this.selectedEntity && this.selectedEntity.id === entity.id;
  }

  public withHover(entity: GenericTableEntity<T>): boolean {
    return entity.state === GenericTableEntityState.READ;
  }

  private handleAction(
    entity: GenericTableEntity<T>,
    genericTableEntityErrors: GenericTableEntityErrors,
    up?: T
  ): void {
    const canDoAction = this.genericTableErrorService.handleErrors(
      entity,
      genericTableEntityErrors
    );
    if (canDoAction) {
      if (up) {
        this.selectedRow = up;
        this.loadSelectedEntity();
        this.updateSelectedEntity(this.selectedEntity);
      }
      if (
        this.genericTableAction === GenericTableAction.EDIT ||
        this.genericTableAction === GenericTableAction.NEW
      ) {
        this.setReadEntityState(entity);
      }
      this.showMandatoryIcon = false;
    }
  }

  private setReadEntityState(entity: GenericTableEntity<T>): void {
    entity.errors = [];
    entity.state = GenericTableEntityState.READ;
  }

  /**
   * Notification d'un changement sur le trie.
   */
  private onSortChange(): void {
    try {
      const name =
        this._options.entityTypes // Pour récupérer le nom de la propriété
          .find((t) => t.name === this.sort.active)?.code || this.sort.active;
      const sort: SortInfo = {
        // Information sur le trie
        name,
        direction: this.sort.direction,
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
      this.sort.sortChange
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => this.onSortChange());
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Initialise le tableau.
   */
  private initTable(): void {
    try {
      this.genericTableEntities = this.options.dataSource.map(
        (entity, index) => {
          return {
            data: entity,
            state: GenericTableEntityState.READ,
            id: index,
          };
        }
      );
      this.entityTypes = this.options.entityTypes;
      this.loadDisplayedColumns();
      this.genericTableEntitiesCopy = getDeepCopy(this.genericTableEntities);
      this.loadSelectedEntity();
    } catch (error) {
      console.error(error);
    }
  }

  private updateSelectedEntity(entity: GenericTableEntity<T>): void {
    this.selectedEntity = entity;
    this.selectedEntityUpdatedEvent.emit(
      this.selectedEntity ? this.selectedEntity.data : null
    );
  }

  private loadSelectedEntity(): void {
    let entity: GenericTableEntity<T>;
    entity = this.genericTableEntities?.find(
      (entity) => entity.data === this.selectedRow
    );
    if (entity) {
      this.selectedEntity = entity;
    } else if (this.selectedEntity) {
      this.selectedEntity = {
        ...this.selectedEntity,
        data: this.selectedRow,
      };
    } else {
      this.selectedEntity = null;
    }
  }

  private loadDisplayedColumns(): void {
    this.displayedColumns = this.showActions
      ? this.genericTableService
          .getDisplayedColumns(this.options)
          .concat(this.actionsHeaderColumnName)
      : this.genericTableService.getDisplayedColumns(this.options);
  }

  private resetTable(): void {
    this.genericTableEntities = this.genericTableEntitiesCopy;
    this.genericTableEntitiesCopy = getDeepCopy(this.genericTableEntities);
  }
}
