import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { isNotNullOrUndefined } from 'codelyzer/util/isNotNullOrUndefined';
import { Financement } from '../../models/financement';
import { Recette } from '../../models/recette';
import { GenericTableOptions } from '../../shared/components/generic-table/models/generic-table-options';
import { GenericTableEntityEvent } from '../../shared/components/generic-table/models/generic-table-entity-event';
import { EntityType } from '../../shared/components/generic-table/models/entity-types';
import { GenericTableCellType } from '../../shared/components/generic-table/globals/generic-table-cell-types';
import { EntityPlaceholder } from '../../shared/components/generic-table/models/entity-placeholder';
import { GenericTableFormError } from '../../shared/components/generic-table/models/generic-table-entity';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
import { RecettesService } from '../../services/recettes.service';

@Component({
  selector: 'app-recettes',
  templateUrl: './recettes.component.html',
  styleUrls: ['./recettes.component.scss'],
})
export class RecettesComponent implements OnInit, OnChanges {
  /**
   * Financement sélectionné
   */
  @Input() public financement: Financement;

  /**
   * Recettes du financement sélectionné
   */
  @Input() public recettes: Recette[];

  /**
   * Recette séléctioné event
   */
  @Output()
  public selectEvent: EventEmitter<Recette> = new EventEmitter<Recette>();

  @Output() public createEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output() public editEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output() public deleteEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public startCreateEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public endCreateEvent: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Titre du tableau
   */
  public title = 'Recettes';

  /**
   * Options du tableau
   */
  public options: GenericTableOptions<Recette>;

  /**
   * Indique si le tableau est en lecture seule.
   */
  public get isReadOnly(): boolean {
    return !this.isAdministrator;
  }

  /**
   * Indique si l'utilisateur est un administrateur.
   */
  public get isAdministrator(): boolean {
    return !!this.isAdministratorGuardService.isAdministrator();
  }

  /**
   * Obtenir les informations d'une recette
   * @param entity
   */
  public getEntityInformationsCallBack: Function;

  /**
   * recette par défaut utilisé lors de la création d'une nouvelle recette
   * @private
   */
  private defaultEntity: Recette = {
    annee_r: 2020,
    montant_r: 0,
  };

  /**
   * Extraire les noms de chaque propriétés du type Recette vers une énumération.
   * Cette énumération facilite le paramétrage du tableau.
   * @private
   */
  private EntityPropertyName = {
    ANNEE_RECETTE: Object.keys(this.defaultEntity)[0],
    MONTANT: Object.keys(this.defaultEntity)[1],
  };

  /**
   * Tableau des types
   * @private
   */
  private entityTypes: EntityType[] = [
    {
      name: 'Année recette',
      type: GenericTableCellType.NUMBER,
      code: this.EntityPropertyName.ANNEE_RECETTE,
    },
    {
      name: 'Montant',
      type: GenericTableCellType.CURRENCY,
      code: this.EntityPropertyName.MONTANT,
    },
  ];

  /**
   * Tableau des placeholders
   * @private
   */
  private entityPlaceHolders: EntityPlaceholder[] = [
    { name: this.EntityPropertyName.ANNEE_RECETTE, value: '2019' },
    { name: this.EntityPropertyName.MONTANT, value: '25 000' },
  ];

  constructor(
    private readonly isAdministratorGuardService: IsAdministratorGuardService,
    private readonly recettesService: RecettesService
  ) {}

  public ngOnInit(): void {
    this.initGenericTableOptions();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.recettes && changes.recettes.currentValue) {
      this.initGenericTableOptions();
    }
  }

  public async onCreate(
    event: GenericTableEntityEvent<Recette>
  ): Promise<void> {
    console.log('AA');
    const recette: Recette = { ...event.entity, id_f: this.financement.id_f };
    console.log('CC');
    const formErrors = this.checkFormErrors(recette);
    console.log('BB');
    if (formErrors) {
      event.callBack({ formErrors });
    } else {
      try {
        const newRecette = await this.recettesService.add(
          recette,
          this.financement,
          this.recettes
        );
        event.callBack(null);
        this.create(newRecette);
        this.createEvent.emit();
      } catch (error) {
        event?.callBack({
          apiError: error,
        });
      }
    }
  }

  public async onEdit(event: GenericTableEntityEvent<Recette>): Promise<void> {
    console.log('00');
    const formErrors = this.checkFormErrors(event.entity);
    if (formErrors) {
      event.callBack({ formErrors });
    } else {
      try {
        console.log('AA');
        const updatedRecette = await this.recettesService.modify(
          event.entity,
          this.financement,
          this.recettes
        );
        event.callBack(null);
        this.modify(updatedRecette);
        this.editEvent.emit();
      } catch (error) {
        event?.callBack({
          apiError: error,
        });
      }
    }
  }

  public async onDelete(
    event: GenericTableEntityEvent<Recette>
  ): Promise<void> {
    const recette: Recette = event.entity;
    try {
      await this.recettesService.delete(recette);
      event.callBack(null);
      this.delete(recette);
      this.deleteEvent.emit();
    } catch (error) {
      event?.callBack({
        apiError: error,
      });
    }
  }

  /**
   * Vérifier le format de chaque champs de la recette
   * @param recette
   */
  public checkFormErrors(recette: Recette): GenericTableFormError[] {
    let genericTableFormErrors: GenericTableFormError[] = [];
    genericTableFormErrors = this.getAnneeRecetteFormError(
      recette.annee_r,
      genericTableFormErrors
    );
    genericTableFormErrors = this.getMontantFormError(
      recette.montant_r,
      genericTableFormErrors
    );
    return genericTableFormErrors.length > 0
      ? genericTableFormErrors
      : undefined;
  }

  /**
   * Vérifier le format du champ 'annee_recette'
   * @param annee_recette
   * @param genericTableFormErrors
   */
  public getAnneeRecetteFormError(
    annee_recette: number,
    genericTableFormErrors: GenericTableFormError[]
  ): GenericTableFormError[] {
    let msg = '';
    if (!annee_recette) {
      msg = 'Année recette requise';
    } else if (!/^(\d{4})$/.test(String(annee_recette))) {
      msg = 'Format année non respecté';
    }
    if (msg !== '') {
      genericTableFormErrors = genericTableFormErrors.concat({
        name: this.EntityPropertyName.ANNEE_RECETTE,
        message: msg,
      });
    }
    return genericTableFormErrors;
  }

  /**
   * Vérifier le format du champ 'montant'
   * @param montant
   * @param genericTableFormErrors
   */
  public getMontantFormError(
    montant: number,
    genericTableFormErrors: GenericTableFormError[]
  ): GenericTableFormError[] {
    let msg = '';
    if (!isNotNullOrUndefined(montant)) {
      msg = 'Montant requis';
    } else if (montant <= 0) {
      msg = 'Le montant doit être supérieur à 0';
    }
    if (msg !== '') {
      genericTableFormErrors = genericTableFormErrors.concat({
        name: this.EntityPropertyName.MONTANT,
        message: msg,
      });
    }
    return genericTableFormErrors;
  }

  public onStartCreation(): void {
    this.startCreateEvent.emit();
  }

  public onEndCreation(): void {
    this.endCreateEvent.emit();
  }

  /**
   * Gestion de la sélection d'une recette
   * @param entity
   */
  public onSelect(
    genericTableEntityEvent: GenericTableEntityEvent<Recette>
  ): void {
    this.selectEvent.emit(genericTableEntityEvent.entity);
  }

  private initGenericTableOptions(): void {
    this.options = {
      dataSource: this.recettes,
      defaultEntity: this.defaultEntity,
      entitySelectBoxOptions: [],
      entityTypes: this.entityTypes,
      entityPlaceHolders: this.entityPlaceHolders,
    };
  }

  private create(recette: Recette): void {
    this.recettes.push(recette);
    this.updateOptionDataSource();
    this.updateOptionDataSource();
  }

  private modify(recette: Recette): void {
    const index = this.recettes.findIndex(
      (recette) => recette.id_r === recette.id_r
    );
    this.recettes[index] = recette;
    this.updateOptionDataSource();
  }

  private delete(recette: Recette): void {
    this.recettes = this.recettes.filter(
      (_recette) => _recette.id_r !== recette.id_r
    );
    this.updateOptionDataSource();
  }

  private updateOptionDataSource(): void {
    this.options = {
      ...this.options,
      dataSource: this.recettes,
    };
  }
}
