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
import { PopupService } from '../../shared/services/popup.service';

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

  @Input() public selectedRecette: Recette;

  /**
   * Recette séléctioné event
   */
  @Output()
  public selectEvent: EventEmitter<Recette> = new EventEmitter<Recette>();

  @Output()
  public createEvent: EventEmitter<Recette> = new EventEmitter<Recette>();

  @Output() public editEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output() public deleteEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public selectedRecetteChangeEvent: EventEmitter<Recette> = new EventEmitter<Recette>();

  @Output()
  public recettesChange = new EventEmitter<Recette[]>();

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

  public onSelectedEntityChange(recette: Recette): void {
    this.selectedRecetteChangeEvent.emit(recette);
  }

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
    private readonly recettesService: RecettesService,
    private readonly popupService: PopupService
  ) {}

  public ngOnInit(): void {
    this.initGenericTableOptions();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.recettes && changes.recettes.currentValue) {
      this.recettes.forEach((recette) => {
        this.recettesService.cleanRecette(recette);
      });
      this.options = {
        ...this.options,
        dataSource: this.recettes,
      };
    }
  }

  public async onCreate(
    event: GenericTableEntityEvent<Recette>
  ): Promise<void> {
    console.log('RECETTE CREATE FROM GT: ', event.entity);
    const recette: Recette = { ...event.entity, id_f: this.financement.id_f };
    const formErrors = this.checkFormErrors(recette);
    if (formErrors) {
      event.callBack({ formErrors });
    } else {
      try {
        const createdRecette = await this.recettesService.add(
          recette,
          this.financement,
          this.recettes
        );
        event.callBack(null);
        this.create(createdRecette);
        this.popupService.success('La recette a été crée.');
        this.createEvent.emit(createdRecette);
      } catch (error) {
        event?.callBack({
          apiError: error,
        });
      }
    }
  }

  public async onEdit(event: GenericTableEntityEvent<Recette>): Promise<void> {
    console.log('RECETTE EDIT FROM GT: ', event.entity);
    const formErrors = this.checkFormErrors(event.entity, true);
    if (formErrors) {
      event.callBack({ formErrors });
    } else {
      try {
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
  public checkFormErrors(
    recette: Recette,
    edit?: boolean
  ): GenericTableFormError[] {
    let genericTableFormErrors: GenericTableFormError[] = [];
    genericTableFormErrors = this.getAnneeError(
      recette,
      genericTableFormErrors
    );
    genericTableFormErrors = this.getMontantError(
      recette,
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
  public getAnneeError(
    recette: Recette,
    genericTableFormErrors: GenericTableFormError[]
  ): GenericTableFormError[] {
    const year = recette.annee_r;
    let msg = '';
    if (!year) {
      msg = 'Année recette requise';
    } else if (!/^(\d{4})$/.test(String(year))) {
      msg = 'Format année non respecté';
    } else if (this.hasDuplicateYear(recette)) {
      msg = 'Année doit être unique';
    } else if (this.hasYearGreaterThanFounding(recette)) {
      msg =
        'Année de la recette doit être antérieur à la date de commande ou darrêté du financement';
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
  public getMontantError(
    recette: Recette,
    genericTableFormErrors: GenericTableFormError[]
  ): GenericTableFormError[] {
    const montant = recette.montant_r;
    let msg = '';
    if (!isNotNullOrUndefined(montant)) {
      msg = 'Montant requis';
    } else if (montant <= 0) {
      msg = 'Le montant doit être supérieur à 0';
    } else if (this.hasAmountGreaterThanFounding(recette)) {
      msg = 'Montant ne doit pas dépasser le montant du financement';
    }
    if (msg !== '') {
      genericTableFormErrors = genericTableFormErrors.concat({
        name: this.EntityPropertyName.MONTANT,
        message: msg,
      });
    }

    return genericTableFormErrors;
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

  private create(createdRecette: Recette): void {
    this.recettes.push(createdRecette);
    this.emitReceiptCahnge();
  }

  private modify(modifiedRecette: Recette): void {
    const index = this.recettes.findIndex(
      (recette) => modifiedRecette.id_r === recette.id_r
    );
    this.recettes[index] = modifiedRecette;
    this.emitReceiptCahnge();
  }

  private delete(deletedRecette: Recette): void {
    this.recettes = this.recettes.filter(
      (recette) => recette.id_r !== deletedRecette.id_r
    );
    this.emitReceiptCahnge();
  }

  private emitReceiptCahnge(): void {
    this.recettesChange.emit(this.recettes);
  }

  private hasDuplicateYear(recette: Recette): boolean {
    const year = recette.annee_r;
    const years = this.recettes.map((_recette) => +_recette.annee_r);
    const tempArray = this.recettes.find(
      (_recette) =>
        _recette.id_r === recette.id_r && _recette.annee_r === recette.annee_r
    )
      ? years
      : [...years, +year];

    return tempArray.some(
      (element, index) => tempArray.indexOf(element) !== index
    );
  }

  private hasAmountGreaterThanFounding(recette: Recette): boolean {
    const amounts = this.recettes
      .filter((_recette) => _recette.id_r !== recette.id_r)
      .map((_recette) => _recette.montant_r);
    const sum = amounts.reduce((a, b) => a + b, 0) + recette.montant_r;

    return sum > this.financement.montant_arrete_f;
  }

  private hasYearGreaterThanFounding(recette: Recette): boolean {
    const yearFounding = new Date(this.financement.date_arrete_f).getFullYear();

    return yearFounding ? recette.annee_r > yearFounding : true;
  }
}
