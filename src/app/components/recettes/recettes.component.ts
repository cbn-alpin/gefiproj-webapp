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
import { RecettesService } from '../../services/recettes.service';
import { PopupService } from '../../shared/services/popup.service';
import { Messages } from '../../models/messages';
import {
  GenericDialogComponent,
  IMessage,
} from '../../shared/components/generic-dialog/generic-dialog.component';
import { take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { SortInfo } from '../../shared/components/generic-table/models/sortInfo';
import { basicSort } from '../../shared/tools/utils';
import { DefaultSortInfo, ProjetCallback } from '../../models/projet';
import { MontantsAffectesService } from '../../services/montants-affectes.service';
import { MontantAffecte } from '../../models/montantAffecte';

@Component({
  selector: 'app-recettes',
  templateUrl: './recettes.component.html',
  styleUrls: ['./recettes.component.scss'],
})
export class RecettesComponent implements OnInit, OnChanges {
  @Input() public financement: Financement;

  @Input() public recettes: Recette[];

  @Input() public selectedRecette: Recette;

  @Input() public defaultSortInfo: DefaultSortInfo;

  @Input() public isAdministrator: boolean;

  @Input() public projectIsBalance: boolean;

  @Output() public selectEvent = new EventEmitter<Recette>();

  @Output() public createEvent = new EventEmitter<ProjetCallback>();

  @Output() public editEvent = new EventEmitter<ProjetCallback>();

  @Output() public deleteEvent = new EventEmitter<ProjetCallback>();

  public title = 'Recettes';

  public options: GenericTableOptions<Recette>;

  public get showActions(): boolean {
    return this.isAdministrator && !this.projectIsBalance;
  }

  /**
   * recette par défaut utilisé lors de la création d'une nouvelle recette
   * @private
   */
  private defaultEntity: Recette = {
    annee_r: null,
    montant_r: null,
  };

  /**
   * Mapping pour les noms des attributs d'un projet.
   */
  private readonly namesMap = {
    ID: { code: 'id_r', name: 'Identifiant' },
    FINANCEMENT: { code: 'financement', name: 'Financement' },
    MONTANT: { code: 'montant_r', name: 'Montant' },
    ANNEE: { code: 'annee_r', name: 'Année recette' },
    ID_FINANCEUR: { code: 'id_f', name: 'Id financeur' },
    DIFFERENCE: { code: 'difference', name: 'Différence' },
  };

  /**
   * Tableau des types
   * @private
   */
  private entityTypes: EntityType[] = [
    {
      name: this.namesMap.ANNEE.name,
      type: GenericTableCellType.NUMBER,
      code: this.namesMap.ANNEE.code,
      sortEnabled: true,
      isMandatory: true,
    },
    {
      name: this.namesMap.MONTANT.name,
      type: GenericTableCellType.CURRENCY,
      code: this.namesMap.MONTANT.code,
      sortEnabled: true,
      isMandatory: true,
    },
    {
      name: this.namesMap.DIFFERENCE.name,
      type: GenericTableCellType.CURRENCY,
      code: this.namesMap.DIFFERENCE.code,
      sortEnabled: true,
      disableEditing: true,
      tooltipHeader:
        'Indique la différence entre le montant de la recette et de ses montants affectés.',
    },
  ];

  /**
   * Tableau des placeholders
   * @private
   */
  private entityPlaceHolders: EntityPlaceholder[] = [
    { name: this.namesMap.ANNEE.code, value: '2019' },
    { name: this.namesMap.MONTANT.code, value: '25 000' },
  ];

  private sortInfo: SortInfo;

  constructor(
    private readonly recettesService: RecettesService,
    private readonly popupService: PopupService,
    private readonly dialog: MatDialog,
    private readonly montantsAffectesService: MontantsAffectesService
  ) {}

  public ngOnInit(): void {
    this.initGenericTableOptions();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.recettes &&
      changes.recettes.currentValue &&
      changes.recettes.previousValue
    ) {
      this.refreshDataTable();
    }
  }

  public async onCreate(
    event: GenericTableEntityEvent<Recette>
  ): Promise<void> {
    const recette: Recette = { ...event.entity, id_f: this.financement.id_f };
    const formErrors = await this.checkFormErrors(recette);
    if (formErrors) {
      this.popupService.error(Messages.ERROR_FORM);
      event.callBack({ formErrors });
    } else {
      try {
        const createdRecette = await this.recettesService.add(recette);
        this.popupService.success(Messages.SUCCESS_CREATE_RECETTE);
        const projetCallback: ProjetCallback = {
          cb: event.callBack,
          id: createdRecette.id_r,
        };
        this.createEvent.emit(projetCallback);
      } catch (error) {
        event?.callBack({
          apiError: Messages.FAILURE_CREATE_RECETTE,
        });
      }
    }
  }

  public async onEdit(event: GenericTableEntityEvent<Recette>): Promise<void> {
    const recette = event.entity;
    const formErrors = await this.checkFormErrors(recette);
    if (formErrors) {
      this.popupService.error(Messages.ERROR_FORM);
      event.callBack({ formErrors });
    } else {
      try {
        const updatedRecette = await this.recettesService.modify(recette);
        this.popupService.success(Messages.SUCCESS_UPDATE_RECETTE);
        const projetCallback: ProjetCallback = {
          cb: event.callBack,
          id: updatedRecette.id_r,
        };
        this.editEvent.emit(projetCallback);
      } catch (error) {
        event?.callBack({
          apiError: Messages.FAILURE_UPDATE_RECETTE,
        });
      }
    }
  }

  public async onDelete(
    event: GenericTableEntityEvent<Recette>
  ): Promise<void> {
    const recette: Recette = event.entity;
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      data: {
        header: `Suppression d'une recette`,
        content: `Voulez-vous supprimer la recette de ${recette.annee_r} ?`,
        type: 'warning',
        action: {
          name: 'Confirmer',
        },
      } as IMessage,
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(async (result) => {
        if (result) {
          try {
            await this.recettesService.delete(recette);
            this.popupService.success(Messages.SUCCESS_DELETE_RECETTE);
            const projetCallback: ProjetCallback = {
              cb: event.callBack,
              id: recette.id_r,
            };
            this.deleteEvent.emit(projetCallback);
          } catch (error) {
            event?.callBack({
              apiError: Messages.FAILURE_DELETE_RECETTE,
            });
          }
        }
      });
  }

  public onSortChanged(sort: SortInfo): void {
    try {
      if (sort) {
        this.sortInfo = sort;
        this.refreshDataTable();
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Vérifier le format de chaque champs de la recette
   * @param recette
   */
  public async checkFormErrors(
    recette: Recette
  ): Promise<GenericTableFormError[]> {
    let genericTableFormErrors: GenericTableFormError[] = [];
    genericTableFormErrors = this.getAnneeError(
      recette,
      genericTableFormErrors
    );
    genericTableFormErrors = this.getMontantError(
      recette,
      genericTableFormErrors
    );

    // Vérifie seulement si pas d'erreurs dans le form
    // Évite de faire un appel API alors que le form n'est pas valide
    // Si id_r est null alors la recette est en cours de création => les règles ci-dessous ne s'appliquent pas dans ce cas de figure
    if (!genericTableFormErrors.length && recette.id_r) {
      const recettes = await this.getMontantsAffectesFromRecette(recette);
      await this.checkValidityOfRecetteAmountWithMontantAffecteAmounts(
        recette,
        recettes,
        genericTableFormErrors
      );
    }

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
    } else if (this.hasYearLowerThanFounding(recette)) {
      msg =
        'Année de la recette doit être postérieur ou égale à la date de commande ou darrêté du financement';
    }
    if (msg !== '') {
      genericTableFormErrors = genericTableFormErrors.concat({
        name: this.namesMap.ANNEE.code,
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
        name: this.namesMap.MONTANT.code,
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
      sortName: this.defaultSortInfo?.headerName,
      sortDirection: this.defaultSortInfo?.sortInfo?.direction,
    };
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

  private hasYearLowerThanFounding(recette: Recette): boolean {
    const yearFounding = !!this.financement.date_arrete_f
      ? new Date(this.financement.date_arrete_f).getFullYear()
      : null;
    return yearFounding ? recette.annee_r < yearFounding : false;
  }

  private refreshDataTable(): void {
    this.options = {
      ...this.options,
      dataSource: basicSort(this.recettes, this.sortInfo),
    };
  }

  /**
   * Vérifie que le montant de la recette est supérieur ou égale à la somme des montants de ses montants affectés
   * @param recette
   * @param montantAffectes
   * @param formErrors
   * @private
   */
  private async checkValidityOfRecetteAmountWithMontantAffecteAmounts(
    recette: Recette,
    montantAffectes: MontantAffecte[],
    formErrors: GenericTableFormError[]
  ): Promise<void> {
    try {
      const montantsAffectesAmounts = montantAffectes.map(
        (montantAffecte) => montantAffecte.montant_ma
      );
      const sumMontantsAffectesAmounts = montantsAffectesAmounts.reduce(
        (a, b) => a + b,
        0
      );
      if (sumMontantsAffectesAmounts > recette.montant_r) {
        const error = {
          name: this.namesMap.MONTANT.code,
          message:
            'Doit être supérieur ou égale à la somme des montants de ses montants affectés',
        };
        formErrors.push(error);
      }
    } catch (e) {
      console.error(e);
    }
  }

  private async getMontantsAffectesFromRecette(
    recette: Recette
  ): Promise<MontantAffecte[]> {
    try {
      return await this.montantsAffectesService.getAll(recette.id_r);
    } catch (e) {
      console.error(e);
    }
  }
}
