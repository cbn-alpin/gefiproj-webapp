import { AccountingsService } from './../../services/accountings.service';
import { PopupService } from 'src/app/shared/services/popup.service';
import { RecetteComptable } from './../../models/recette-comptable';
import { Component, OnInit } from '@angular/core';
import { GenericTableOptions } from 'src/app/shared/components/generic-table/models/generic-table-options';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { SortInfo } from 'src/app/shared/components/generic-table/models/sortInfo';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
import { MatDialog } from '@angular/material/dialog';
import { GenericTableEntityEvent } from 'src/app/shared/components/generic-table/models/generic-table-entity-event';
import {
  GenericDialogComponent,
  IMessage,
} from 'src/app/shared/components/generic-dialog/generic-dialog.component';
import { first } from 'rxjs/operators';
import { GenericTableFormError } from 'src/app/shared/components/generic-table/models/generic-table-entity';
import { basicSort } from 'src/app/shared/tools/utils';

/**
 * Affiche les recettes comptables.
 */
@Component({
  selector: 'app-recettes-comptables',
  templateUrl: './recettes-comptables.component.html',
  styleUrls: ['./recettes-comptables.component.scss'],
})
export class RecettesComptablesComponent implements OnInit {
  /**
   * Titre du tableau générique.
   */
  public readonly title = 'Recettes comptables';

  /**
   * Liste des recettes comptables.
   */
  public accountings: RecetteComptable[] = [];

  /**
   * Mapping pour les noms des attributs d'une recette comptable.
   */
  private readonly namesMap = {
    id: { code: 'id_rc', name: 'Identifiant' },
    year: { code: 'annee_rc', name: 'Année' },
    amount: { code: 'montant_rc', name: 'Montant' },
  };

  /**
   * Représente une nouvelle recette comptable et définit les colonnes à afficher.
   */
  private readonly defaultEntity = {
    annee_rc: new Date(Date.now()).getFullYear(),
    montant_rc: 0,
  } as RecetteComptable;

  /**
   * Paramètres du tableau des recettes comptables.
   */
  public options: GenericTableOptions<RecetteComptable> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      {
        code: this.namesMap.year.code,
        type: GenericTableCellType.NUMBER,
        name: this.namesMap.year.name,
        sortEnabled: true,
        isMandatory: true,
      },
      {
        code: this.namesMap.amount.code,
        type: GenericTableCellType.CURRENCY,
        name: this.namesMap.amount.name,
        sortEnabled: false,
        isMandatory: true,
      },
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: [],
    sortName: this.namesMap.year.name,
    sortDirection: 'desc',
    idPropertyName: this.namesMap.id.code,
  };

  /**
   * Indique si l'utilisateur est un administrateur.
   */
  public get isAdministrator(): boolean {
    return this.adminSrv.isAdministrator();
  }

  /**
   * Indique le trie courant.
   */
  public sortInfo: SortInfo;

  /**
   * Affiche les recettes comptables.
   * @param adminSrv : permet de vérifier si l'utilisateur est un administrateur.
   * @param dialog : affiche une boîte de dialogue.
   * @param popupService : affiche une information.
   * @param accountingsSrv : permet de charger les recettes comptables.
   */
  constructor(
    private adminSrv: IsAdministratorGuardService,
    private dialog: MatDialog,
    private popupService: PopupService,
    private accountingsSrv: AccountingsService
  ) {}

  /**
   * Initialise le composant.
   */
  async ngOnInit(): Promise<void> {
    try {
      await this.loadData();
      this.refreshDataTable();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Une recette comptable a été créé et initialisé dans le tableau.
   * @param event : encapsule la recette comptable à ajouter.
   */
  async onCreate(
    event: GenericTableEntityEvent<RecetteComptable>
  ): Promise<void> {
    try {
      let accounting = event?.entity;
      if (!accounting) {
        throw new Error('La recette comptable n\'existe pas');
      }

      if (this.validateForGenericTable(event)) {
        accounting = await this.accountingsSrv.add(accounting);
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.addAccounting(accounting);
        this.refreshDataTable(); // Pour le trie
        this.popupService.success(
          `La recette comptable sur l'année ${accounting.annee_rc} a été créé.`
        );
      }
    } catch (error) {
      event?.callBack({
        apiError: error,
      });
    }
  }

  /**
   * Une recette comptable a été modifiée dans le tableau.
   * @param event : encapsule la recette comptable à modifier.
   */
  async onEdit(
    event: GenericTableEntityEvent<RecetteComptable>
  ): Promise<void> {
    try {
      let accounting = event?.entity;
      if (!accounting) {
        throw new Error('La recette comptable n\'existe pas');
      }

      if (this.validateForGenericTable(event)) {
        accounting = await this.accountingsSrv.modify(accounting);
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.updateAccounting(accounting);
        this.refreshDataTable(); // Pour le trie
        this.popupService.success(
          `La recette comptable sur l'année ${accounting.annee_rc} a été modifiée.`
        );
      }
    } catch (error) {
      event?.callBack({
        apiError: error,
      });
    }
  }

  /**
   * Une recette comptable a été supprimée du tableau.
   * @param event : encapsule la recette comptable à supprimer.
   */
  async onDelete(
    event: GenericTableEntityEvent<RecetteComptable>
  ): Promise<void> {
    try {
      const accounting = event?.entity;
      if (!accounting) {
        throw new Error('La recette comptable n\'existe pas');
      }

      // Etes-vous sûr ?
      const data: IMessage = {
        header: 'Suppression de la recette comptable',
        content: `Vous vous apprêtez à supprimer la recette comptable de l'année ${accounting.annee_rc}. Etes-vous certain de vouloir la supprimer ?`,
        type: 'warning',
        action: {
          name: 'Confirmer',
        },
      };
      const dialogRef = this.dialog.open(GenericDialogComponent, {
        data,
      });
      const dialogResult = await dialogRef
        .afterClosed()
        .pipe(first())
        .toPromise();
      const okToDelete = !!dialogResult;

      if (okToDelete) {
        // Suppression
        await this.accountingsSrv.delete(accounting);
        event.callBack(null); // Valide la modification dans le composant DataTable fils
        this.deleteAccounting(accounting);
        this.refreshDataTable();
        this.popupService.success(
          `La recette comptable de l'année ${accounting.annee_rc} a été supprimée.`
        );
      } else {
        // Annulation
        event?.callBack({
          apiError: 'La suppression est annulée.',
        });
      }
    } catch (error) {
      event?.callBack({
        apiError: error,
      });
    }
  }

  /**
   * Supprime une recette comptable dans le repo interne.
   * @param accounting : recette comptable à supprimer.
   */
  private deleteAccounting(accounting: RecetteComptable): void {
    const index = this.accountings.findIndex(
      (p) => p.id_rc === accounting.id_rc
    );

    if (index >= 0) {
      this.accountings.splice(index, 1);
    }
  }

  /**
   * Met à jour une recette comptable dans le repo interne.
   * @param accounting : version modifiée.
   */
  private updateAccounting(accounting: RecetteComptable): void {
    const index = this.accountings.findIndex(
      (p) => p.id_rc === accounting.id_rc
    );

    if (index >= 0) {
      this.accountings[index] = accounting;
    }
  }

  /**
   * Vérifie la validité de la recette comptable en paramètre. Si la recette comptable est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule une nouvelle recette comptable ou une recette comptable modifiée.
   */
  private validateForGenericTable(
    gtEvent: GenericTableEntityEvent<RecetteComptable>
  ): boolean {
    if (!gtEvent) {
      throw new Error('Le paramètre \'gtEvent\' est invalide');
    }

    try {
      const accounting = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      if (typeof accounting.annee_rc === 'string') {
        // Le tableau retourne une string !
        accounting.annee_rc = parseInt(accounting.annee_rc as string, 10);
      }
      if (typeof accounting.montant_rc === 'string') {
        // Le tableau retourne une string !
        accounting.montant_rc = parseFloat(accounting.montant_rc as string);
      }

      const min = 2010;
      const max = new Date(Date.now()).getFullYear() + 20;
      if (
        isNaN(accounting.annee_rc) ||
        accounting.annee_rc < min ||
        accounting.annee_rc > max
      ) {
        const error = {
          name: this.namesMap.year.code,
          message: `L'année doit être un entier supérieure à ${
            min - 1
          } et inférieure à ${max + 1}`,
        };

        formErrors.push(error);
      }

      const isSameAccounting =
        this.accountings.findIndex(
          (e) =>
            e.annee_rc === accounting.annee_rc && e.id_rc !== accounting.id_rc
        ) >= 0;
      if (isSameAccounting) {
        const error = {
          name: this.namesMap.year.code,
          message: 'L\'année doit être unique',
        };

        formErrors.push(error);
      }

      if (isNaN(accounting.montant_rc) || accounting.montant_rc <= 0) {
        const newLocal = 'Le montant doit être une valeur strictement positive';
        const error = {
          name: this.namesMap.amount.code,
          message: newLocal,
        };

        formErrors.push(error);
      }

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
   * Ajoute une recette comptable au repo interne.
   * @param project : recette comptable à ajouter.
   */
  private addAccounting(accounting: RecetteComptable): void {
    this.accountings.push(accounting);
  }

  /**
   * Charge les recettes comptables.
   */
  private async loadData(): Promise<void> {
    try {
      this.accountings = await this.accountingsSrv.getAll();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Le trie du tableau a changé.
   * @param sort : défini le trie à appliquer.
   */
  onSortChanged(sort: SortInfo): void {
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
   * Met à jour les données d'affichage.
   */
  private refreshDataTable(): void {
    try {
      const dataSource = basicSort(this.accountings, this.sortInfo);

      this.options = Object.assign({}, this.options, {
        dataSource,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
