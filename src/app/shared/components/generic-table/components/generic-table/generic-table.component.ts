import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
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
  implements OnInit, AfterViewInit, OnDestroy {
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

  @Input() autoSelectFirstRow = false;

  @Input() public selectedEntity: GenericTableEntity<T>;

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

  @Output() startCreateEvent = new EventEmitter<void>();

  @Output() endCreateEvent = new EventEmitter<void>();

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

  /**
   * Copie du tableau.
   * Utile lors de l'annulation de l'édition d'une ligne.
   */
  public genericTableEntitiesCopy: GenericTableEntity<T>[];

  public actionsHeaderColumnName: string = 'Actions';

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  // tslint:disable-next-line: variable-name
  private _options: GenericTableOptions<T>;

  private genericTableAction: GenericTableAction;

  constructor(
    private readonly router: Router,
    public readonly genericTableService: GenericTableService<T>,
    public readonly genericTableErrorService: GenericTableErrorService<T>,
    public readonly genericTableTypeService: GenericTableTypeService<T>
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
    this.selectedEntity = entity;
    const cleanedGenericTableEntities = this.genericTableService.getOtherEntitiesReseted(
      this.genericTableEntities,
      this.genericTableEntitiesCopy,
      entity
    );
    this.genericTableEntities = cleanedGenericTableEntities.filter(
      (cleanedEntity) => cleanedEntity !== null
    );
    entity.state = GenericTableEntityState.EDIT;
  }

  public edit(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.genericTableAction = GenericTableAction.EDIT;
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableEntities.map((row) => row.data),
      callBack: (genericTableEntityErrors?: GenericTableEntityErrors) =>
        this.handleAction(entity, genericTableEntityErrors),
    };
    this.editEvent.emit(genericTableEntityEvent);
  }

  public cancelEditing(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    const entityToCopy = this.genericTableEntitiesCopy.find(
      (dataCopy) => dataCopy.id === entity.id
    );
    const entityCopied = this.genericTableService.getDeepCopy(entityToCopy);
    this.genericTableEntities = this.genericTableEntities.map((entity) =>
      entity.id === entityCopied.id ? entityCopied : entity
    );
    this.genericTableErrorService.cleanErrors(entity);
  }

  public onCreate(): void {
    this.genericTableAction = GenericTableAction.NEW;
    const defaultEntityCopied = this.genericTableService.getDeepCopy(
      this.options.defaultEntity
    );
    const newElement: GenericTableEntity<T> = {
      data: defaultEntityCopied,
      state: GenericTableEntityState.NEW,
      id: this.genericTableEntities.length,
    };
    this.selectedEntity = newElement;
    this.genericTableEntities = this.genericTableService.getOtherEntitiesReseted(
      this.genericTableEntities,
      this.genericTableEntitiesCopy
    );
    this.genericTableEntities = [newElement].concat(this.genericTableEntities);
    this.startCreateEvent.emit();
  }

  public create(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.genericTableAction = GenericTableAction.NEW;
    const genericTableEntityEvent: GenericTableEntityEvent<T> = {
      entity: entity.data,
      updatedGenericTable: this.genericTableEntities.map((row) => row.data),
      callBack: (genericTableEntityErrors?: GenericTableEntityErrors) =>
        this.handleAction(entity, genericTableEntityErrors),
    };
    this.createEvent.emit(genericTableEntityEvent);
  }

  public cancelCreation(event, entity: GenericTableEntity<T>): void {
    event.stopPropagation();
    this.genericTableEntities = this.genericTableEntities?.filter(
      (data) => entity.data !== data.data
    );
    this.endCreateEvent.emit();
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
  }

  /**
   * Lorsqu'une entité est sélectionné dans le tableau, on émet un événement avec l'entité en paramètre
   * @param genericTableEntity : l'élément sélectionné.
   */
  public select(genericTableEntity: GenericTableEntity<T>): void {
    if (
      genericTableEntity.state === GenericTableEntityState.READ &&
      (!this.selectedEntity || this.selectedEntity.id !== genericTableEntity.id)
    ) {
      this.selectedEntity = genericTableEntity;
      console.log('SELECT: ', this.selectedEntity);
      const genericTableEntityEvent: GenericTableEntityEvent<T> = {
        entity: genericTableEntity.data,
      };
      this.selectEvent.emit(genericTableEntityEvent);
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
      this.genericTableErrorService.openSnackBarError('Navigation impossible');
    }
  }

  public canBeSelected(entity: GenericTableEntity<T>): boolean {
    return this.selectedEntity && this.selectedEntity.id === entity.id;
  }

  private handleAction(
    entity: GenericTableEntity<T>,
    genericTableEntityErrors: GenericTableEntityErrors
  ): void {
    const canDoAction = this.genericTableErrorService.handleErrors(
      entity,
      genericTableEntityErrors
    );
    if (canDoAction) {
      if (this.genericTableAction === GenericTableAction.EDIT) {
        this.handleActionEdit(entity);
      } else if (this.genericTableAction === GenericTableAction.NEW) {
        this.handleActionNew(entity);
      } else if (this.genericTableAction === GenericTableAction.DELETE) {
        this.handleActionDelete(entity);
      }
    }
  }

  private handleActionEdit(entity: GenericTableEntity<T>): void {
    entity.errors = [];
    entity.state = GenericTableEntityState.READ;
  }

  private handleActionNew(entity: GenericTableEntity<T>): void {
    entity.errors = [];
    entity.state = GenericTableEntityState.READ;
  }

  private handleActionDelete(entity: GenericTableEntity<T>): void {}

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
      this.genericTableEntities = this.options.dataSource?.map(
        (entity, index) => {
          return {
            data: entity,
            state: GenericTableEntityState.READ,
            id: index,
          };
        }
      );
      this.entityTypes = this.options.entityTypes;
      this.displayedColumns = this.showActions
        ? this.genericTableService
            .getDisplayedColumns(this.options)
            .concat(this.actionsHeaderColumnName)
        : this.genericTableService.getDisplayedColumns(this.options);
      this.genericTableEntitiesCopy = this.genericTableService.getDeepCopy(
        this.genericTableEntities
      );
      this.selectFirstRow();
    } catch (error) {
      console.error(error);
    }
  }

  private selectFirstRow(): void {
    if (this.genericTableEntities.length > 0 && this.autoSelectFirstRow) {
    }
  }
}
