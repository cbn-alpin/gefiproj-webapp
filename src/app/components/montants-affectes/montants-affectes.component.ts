import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MontantAffecte } from '../../models/montantAffecte';
import { ProjetCallback } from '../../models/projet';
import { Recette } from '../../models/recette';
import { AmountsService } from '../../services/amounts.service';
import {
  GenericDialogComponent,
  IMessage
} from '../../shared/components/generic-dialog/generic-dialog.component';
import { GenericTableCellType } from '../../shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableFormError } from '../../shared/components/generic-table/models/generic-table-entity';
import { GenericTableEntityEvent } from '../../shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from '../../shared/components/generic-table/models/generic-table-options';
import { SortInfo } from '../../shared/components/generic-table/models/sortInfo';
import { PopupService } from '../../shared/services/popup.service';
import { basicSort } from '../../shared/tools/utils';

@Component({
  selector: 'app-montants-affectes',
  templateUrl: './montants-affectes.component.html',
  styleUrls: ['./montants-affectes.component.scss'],
})
export class MontantsAffectesComponent implements OnChanges {
  /**
   * Titre du tableau générique
   */
  readonly title = 'Montants Affectés';

  /**
   * Recette selectionnée
   */
  @Input() public receipt: Recette;

  @Input() public isAdministrator: boolean;

  @Input() public projectIsBalance: boolean;

  /**
   * Données source du tableau générique
   * @private
   */
  @Input() public montantsAffectes: MontantAffecte[];

  @Output() public createEvent = new EventEmitter<ProjetCallback>();

  @Output() public editEvent = new EventEmitter<ProjetCallback>();

  @Output() public deleteEvent = new EventEmitter<ProjetCallback>();

  @Output() public startAction = new EventEmitter<void>();

  @Output() public endAction = new EventEmitter<void>();

  public get showActions(): boolean {
    return this.isAdministrator && !this.projectIsBalance;
  }

  /**
   * Représente un nouveau montant affecté et définit les colonnes à afficher.
   */
  private readonly defaultEntity: MontantAffecte = {
    id_ma: undefined,
    recette: undefined,
    montant_ma: undefined,
    annee_ma: undefined,
    id_r: undefined,
  };

  /**
   * Mapping pour les noms des attributs d'un montant affecté.
   */
  private readonly namesMap = {
    id_ma: { code: 'id_ma', name: 'Identifiant Montant Affecté' },
    recette: { code: 'id_r', name: 'Recette' },
    montant_ma: { code: 'montant_ma', name: 'Montant' },
    annee_ma: { code: 'annee_ma', name: "Année d'affectation" },
    id_r: { code: 'id_r', name: 'id de la recette' },
  };

  /**
   * Paramètres du tableau des montants affectés.
   */
  options: GenericTableOptions<MontantAffecte> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      {
        name: this.namesMap.annee_ma.name,
        type: GenericTableCellType.NUMBER,
        code: this.namesMap.annee_ma.code,
        sortEnabled: true,
        isMandatory: true,
      },
      {
        name: this.namesMap.montant_ma.name,
        type: GenericTableCellType.CURRENCY,
        code: this.namesMap.montant_ma.code,
        sortEnabled: true,
        isMandatory: true,
      },
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: [],
    sortName: this.namesMap.annee_ma.name,
    sortDirection: 'asc',
    idPropertyName: this.namesMap.id_ma.code,
  };

  /**
   * Date PipeAmountsService
   */
  pipe: DatePipe;

  private sortInfo: SortInfo;

  constructor(
    private readonly amountsService: AmountsService,
    private readonly popupService: PopupService,
    public dialog: MatDialog
  ) {}

  /**
   * Initialise le composant.
   */
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.montantsAffectes && changes.montantsAffectes.currentValue) {
      this.refreshDataTable();
    }
  }

  /**
   * Un montant affecté a été modifié dans le tableau.
   * @param event : encapsule le montant affecté à modifier.
   */
  async onEdit(event: GenericTableEntityEvent<MontantAffecte>): Promise<void> {
    const create = false;
    try {
      const montant = event?.entity;
      if (!montant) {
        throw new Error("Le montant affecté n'existe pas");
      }

      if (this.validateForGenericTable(event, create)) {
        delete montant.recette;
        const updatedMontant = await this.amountsService.modify(montant);
        const projetCallback: ProjetCallback = {
          cb: event.callBack,
          id: updatedMontant.id_ma,
          message: 'Le montant affecté a été modifié',
        };
        this.editEvent.emit(projetCallback);
      }
    } catch (error) {
      console.log('er', error);
      this.popupService.error(
        'Impossible de modifier les montants affectés : ' + error.message
      );
    }
  }

  /**
   * Vérifie la validité du montant affecté en paramètre. Si le montant affecté est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule un nouveau montant affecté ou un montant affecté modifié.
   */
  private validateForGenericTable(
    gtEvent: GenericTableEntityEvent<MontantAffecte>,
    create: boolean
  ): boolean {
    if (!gtEvent) {
      throw new Error("Le paramètre 'gtEvent' est invalide");
    }

    try {
      const montant = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      this.verifForms(montant, formErrors, create);
      if (formErrors.length > 0) {
        gtEvent.callBack({
          formErrors,
        });

        this.popupService.error('Veuillez vérifier vos données');
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error(error);
      return true; // Problème inattendu : le serveur vérifiera les données
    }
  }

  /**
   * Vérifie le forms du montant affecté.
   * @param montant affecté : montant affecté à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifForms(
    montant: MontantAffecte,
    formErrors: GenericTableFormError[],
    create: boolean
  ): void {
    if (!montant.montant_ma) {
      const error = {
        name: this.namesMap.montant_ma.code,
        message: 'Un montant doit être défini.',
      };
      formErrors.push(error);
    }

    if (!montant.annee_ma) {
      const error = {
        name: this.namesMap.annee_ma.code,
        message: "Une année d 'affectation doit être définie.",
      };
      formErrors.push(error);
    }
    if (create) {
      if (this.checkMontantCreate(montant)) {
        const error = {
          name: this.namesMap.montant_ma.code,
          message:
            'La somme des montants est supérieur au montant de la recette !',
        };
        formErrors.push(error);
      }
    } else if (this.checkMontantEdit(montant)) {
      const error = {
        name: this.namesMap.montant_ma.code,
        message:
          'La somme des montants est supérieur au montant de la recette !',
      };
      formErrors.push(error);
    }
  }

  /**
   * Un montant affecté a été créé et initialisé dans le tableau.
   * @param event : encapsule le montant affecté à modifier.
   */
  async onCreate(
    event: GenericTableEntityEvent<MontantAffecte>
  ): Promise<void> {
    const create = true;
    try {
      const montant = event.entity;
      if (!montant) {
        throw new Error("Le montant affecté n'existe pas");
      }

      if (this.validateForGenericTable(event, create)) {
        const createdMontant = await this.amountsService.add(
          montant,
          Number(this.receipt.id_r)
        );
        const projetCallback: ProjetCallback = {
          cb: event.callBack,
          id: createdMontant.id_ma,
          message: 'Le montant affecté a été créé',
        };
        this.createEvent.emit(projetCallback);
      }
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de créer le montant affecté : ' + error.message
      );
    }
  }

  /**
   * Supprimer un montant affecté avec confirmation avec un popup
   * @param entity
   */
  async onDelete(
    event: GenericTableEntityEvent<MontantAffecte>
  ): Promise<void> {
    try {
      const montant = event?.entity;
      if (!montant) {
        throw new Error("Le montant affecté n'existe pas");
      }
      const dialogRef = this.dialog.open(GenericDialogComponent, {
        data: {
          header: 'Suppression du montant affecté',
          content:
            'Voulez-vous supprimer ce montant affecté de montant ' +
            montant.montant_ma +
            " de l'année " +
            montant.annee_ma +
            '?',
          type: 'warning',
          action: {
            name: 'Confirmer',
          },
        } as IMessage,
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.amountsService.delete(montant);
          const projetCallback: ProjetCallback = {
            cb: event.callBack,
            id: montant.id_ma,
            message:
              'Le montant affecté de montant ' +
              montant.montant_ma +
              ' €, a été supprimé du projet.',
          };
          this.deleteEvent.emit(projetCallback);
        }
      });
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de supprimer le montant affecté : ' + error.message
      );
      event?.callBack({
        apiError: 'Impossible de supprimer le montant affecté.',
      });
    }
  }

  /**
   * Le trie du tableau a changé.
   * @param sort : défini le trie à appliquer.
   */
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

  public onStartAction(): void {
    this.startAction.emit();
  }

  public onEndAction(): void {
    this.endAction.emit();
  }

  /**
   * Vérifier que la somme des montants est inférieur ou égale au montant de la recette lors de la mise à jour d'un montant
   * @param montant, montant affecté mis à jour
   */
  private checkMontantEdit(montant: MontantAffecte): Boolean {
    let sumAmounts = 0;
    this.montantsAffectes.forEach((amount) => {
      if (amount.id_ma !== montant.id_ma) {
        sumAmounts += +Number(amount.montant_ma);
      }
    });
    return Number(montant.montant_ma) + sumAmounts > this.receipt.montant_r;
  }

  /**
   * Vérifier que la somme des montants est inférieur ou égale au montant de la recette lors de la mise à jour d'un montant
   * @param montant, montant affecté mis à jour
   */
  private checkMontantCreate(montant: MontantAffecte): Boolean {
    let sumAmounts = 0;
    this.montantsAffectes.forEach((amount) => {
      sumAmounts += +Number(amount.montant_ma);
    });
    return Number(montant.montant_ma) + sumAmounts > this.receipt.montant_r;
  }

  private refreshDataTable(): void {
    this.options = {
      ...this.options,
      dataSource: basicSort(this.montantsAffectes, this.sortInfo),
    };
  }
}
