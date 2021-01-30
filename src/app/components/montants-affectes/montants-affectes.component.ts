import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MontantAffecte } from '../../models/montantAffecte';
import { Recette } from '../../models/recette';
import { GenericTableOptions } from '../../shared/components/generic-table/models/generic-table-options';
import { GenericTableCellType } from '../../shared/components/generic-table/globals/generic-table-cell-types';
import { DatePipe } from '@angular/common';
import { IsAdministratorGuardService } from '../../services/authentication/is-administrator-guard.service';
import { MontantsAffectesService } from '../../services/montants-affectes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GenericTableEntityEvent } from '../../shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableFormError } from '../../shared/components/generic-table/models/generic-table-entity';
import {
  GenericDialogComponent,
  IMessage,
} from '../../shared/components/generic-dialog/generic-dialog.component';
import { PopupService } from '../../shared/services/popup.service';

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

  /**
   * Données source du tableau générique
   * @private
   */
  @Input() public montantsAffectes: MontantAffecte[];

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
      },
      {
        name: this.namesMap.montant_ma.name,
        type: GenericTableCellType.CURRENCY,
        code: this.namesMap.montant_ma.code,
      },
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: [],
  };
  /**
   * Indique si le tableau peut-être modifié.
   */
  public get showActions(): boolean {
    return !!this.adminSrv.isAdministrator();
  }
  /**
   * Date Pipe
   */
  pipe: DatePipe;

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
    return !!this.adminSrv.isAdministrator();
  }

  constructor(
    private readonly adminSrv: IsAdministratorGuardService,
    private readonly montantsAffectesService: MontantsAffectesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly popupService: PopupService,
    public dialog: MatDialog
  ) {}

  /**
   * Initialise le composant.
   */
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.montantsAffectes && changes.montantsAffectes.currentValue) {
      try {
        this.pipe = new DatePipe('fr-FR');
        //await this.loadMontantsAffectes(Number(this.receiptId));
        this.initDtOptions();
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   * Charge les montants affectes depuis le serveur.
   */
  async loadMontantsAffectes(receiptId: number): Promise<MontantAffecte[]> {
    try {
      this.montantsAffectes =
        (await this.montantsAffectesService.getAll(receiptId)) || [];
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de charger les montants affectés : ' + error.error
      );
      return Promise.reject(error);
    }
  }

  /**
   * Initialise les options de la table générique.
   */
  private initDtOptions(): void {
    const dataSource = this.montantsAffectes;
    this.options = Object.assign({}, this.options, {
      dataSource,
    });
  }

  /**
   * Met à jour les données d'affichage.
   */
  private async refreshDataTable() {
    try {
      await this.loadMontantsAffectes(Number(this.receipt.id_r));
      const dataSource = this.montantsAffectes;

      this.options = Object.assign({}, this.options, {
        dataSource,
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Un montant affecté a été modifié dans le tableau.
   * @param event : encapsule le montant affecté à modifier.
   */
  async onEdit(event: GenericTableEntityEvent<MontantAffecte>): Promise<void> {
    try {
      let montant = event?.entity;
      if (!montant) {
        throw new Error("Le montant affecté n'existe pas");
      }

      if (this.validateForGenericTable(event)) {
        if (this.checkMontantEdit(montant))
          this.popupService.error(
            'La somme des montants est supérieur au montant de la recette !'
          );
        else {
          if (Number(montant.annee_ma) < Number(this.receipt.annee_r))
            this.popupService.error(
              "L'année saisie est inférieure à celle de la recette !"
            );
          else {
            console.log(montant.montant_ma);
            console.log(montant.id_r);
            delete montant.recette;
            await this.montantsAffectesService.put(montant);
            await this.refreshDataTable();
            event.callBack(null); // Valide la modification dans le composant DataTable fils
          }
        }
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
    gtEvent: GenericTableEntityEvent<MontantAffecte>
  ): boolean {
    if (!gtEvent) {
      throw new Error("Le paramètre 'gtEvent' est invalide");
    }

    try {
      const montant = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      this.verifForms(montant, formErrors);
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
    formErrors: GenericTableFormError[]
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
  }

  /**
   * Un montant affecté a été créé et initialisé dans le tableau.
   * @param event : encapsule le montant affecté à modifier.
   */
  async onCreate(
    event: GenericTableEntityEvent<MontantAffecte>
  ): Promise<void> {
    try {
      let montant = event.entity;
      if (!montant) {
        throw new Error("Le montant affecté n'existe pas");
      }

      if (this.validateForGenericTable(event)) {
        if (this.checkMontantCreate(montant))
          this.popupService.error(
            'La somme des montants est supérieur au montant de la recette !'
          );
        else {
          if (Number(montant.annee_ma) < Number(this.receipt.annee_r))
            this.popupService.error(
              "L'année saisie est inférieure à celle de la recette !"
            );
          else {
            await this.montantsAffectesService.post(
              montant,
              Number(this.receipt.id_r)
            );
            await this.refreshDataTable();
            event.callBack(null); // Valide la modification dans le composant DataTable fils
          }
        }
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
        data: <IMessage>{
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
        },
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          await this.montantsAffectesService.delete(montant);
          this.popupService.success(
            'Le montant affecté de montant ' +
              montant.montant_ma +
              ' €, a été supprimé du projet.'
          );
          await this.refreshDataTable();
          event.callBack(null);
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
}
