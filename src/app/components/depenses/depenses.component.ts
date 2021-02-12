import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
import { ExpensesService } from 'src/app/services/expenses.service';
import {
  GenericDialogComponent,
  IMessage,
} from 'src/app/shared/components/generic-dialog/generic-dialog.component';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableFormError } from 'src/app/shared/components/generic-table/models/generic-table-entity';
import { GenericTableEntityEvent } from 'src/app/shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from 'src/app/shared/components/generic-table/models/generic-table-options';
import { SortInfo } from 'src/app/shared/components/generic-table/models/sortInfo';
import { PopupService } from 'src/app/shared/services/popup.service';
import { Depense } from './../../models/depense';
import { basicSort } from '../../shared/tools/utils';

/**
 * Affiche les dépenses.
 */
@Component({
  selector: 'app-depenses',
  templateUrl: './depenses.component.html',
  styleUrls: ['./depenses.component.scss'],
})
export class DepensesComponent implements OnInit {
  /**
   * Titre du tableau générique.
   */
  public readonly title = 'Dépenses';

  /**
   * Liste des dépenses.
   */
  public expenses: Depense[] = [];

  /**
   * Mapping pour les noms des attributs d'une dépense.
   */
  private readonly namesMap = {
    id: { code: 'id_d', name: 'Identifiant' },
    year: { code: 'annee_d', name: 'Année' },
    amount: { code: 'montant_d', name: 'Montant' },
  };

  /**
   * Représente une nouvelle dépense et définit les colonnes à afficher.
   */
  private readonly defaultEntity = {
    annee_d: new Date(Date.now()).getFullYear(),
    montant_d: 0,
  } as Depense;

  /**
   * Paramètres du tableau des dépenses.
   */
  public options: GenericTableOptions<Depense> = {
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
   * Affiche les dépenses.
   * @param adminSrv : permet de vérifier si l'utilisateur est un administrateur.
   * @param dialog : affiche une boîte de dialogue.
   * @param popupService : affiche une information.
   * @param expensesSrv : permet de charger les dépenses.
   */
  constructor(
    private adminSrv: IsAdministratorGuardService,
    private dialog: MatDialog,
    private popupService: PopupService,
    private expensesSrv: ExpensesService
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
   * Une dépense a été créé et initialisé dans le tableau.
   * @param event : encapsule la dépense à ajouter.
   */
  async onCreate(event: GenericTableEntityEvent<Depense>): Promise<void> {
    try {
      let expense = event?.entity;
      if (!expense) {
        throw new Error("La dépense n'existe pas");
      }

      if (this.validateForGenericTable(event)) {
        expense = await this.expensesSrv.add(expense);
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.addExpense(expense);
        this.refreshDataTable(); // Pour le trie
        this.popupService.success(
          `La dépense sur l'année ${expense.annee_d} a été créé.`
        );
      }
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: error,
      });
    }
  }

  /**
   * Une dépense a été modifiée dans le tableau.
   * @param event : encapsule la dépense à modifier.
   */
  async onEdit(event: GenericTableEntityEvent<Depense>): Promise<void> {
    try {
      let expense = event?.entity;
      if (!expense) {
        throw new Error("La dépense n'existe pas");
      }

      if (this.validateForGenericTable(event)) {
        expense = await this.expensesSrv.modify(expense);
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.updateExpense(expense);
        this.refreshDataTable(); // Pour le trie
        this.popupService.success(
          `La dépense sur l'année ${expense.annee_d} a été modifiée.`
        );
      }
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: error,
      });
    }
  }

  /**
   * Une dépense a été supprimée du tableau.
   * @param event : encapsule la dépense à supprimer.
   */
  async onDelete(event: GenericTableEntityEvent<Depense>): Promise<void> {
    try {
      const expense = event?.entity;
      if (!expense) {
        throw new Error("La dépense n'existe pas");
      }

      // Etes-vous sûr ?
      const data: IMessage = {
        header: 'Suppression de la dépense',
        content: `Vous vous apprêtez à supprimer la dépense de l'année ${expense.annee_d}. Etes-vous certain de vouloir la supprimer ?`,
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
        await this.expensesSrv.delete(expense);
        event.callBack(null); // Valide la modification dans le composant DataTable fils
        this.deleteExpense(expense);
        this.refreshDataTable();
        this.popupService.success(
          `La dépense de l'année ${expense.annee_d} a été supprimée.`
        );
      } else {
        // Annulation
        event?.callBack({
          apiError: 'La suppression est annulée.',
        });
      }
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: error,
      });
    }
  }

  /**
   * Supprime une dépense dans le repo interne.
   * @param expense : dépense à supprimer.
   */
  private deleteExpense(expense: Depense): void {
    const index = this.expenses.findIndex((p) => p.id_d === expense.id_d);

    if (index >= 0) {
      this.expenses.splice(index, 1);
    }
  }

  /**
   * Met à jour une dépense dans le repo interne.
   * @param expense : dépense modifiée.
   */
  private updateExpense(expense: Depense): void {
    const index = this.expenses.findIndex((p) => p.id_d === expense.id_d);

    if (index >= 0) {
      this.expenses[index] = expense;
    }
  }

  /**
   * Vérifie la validité de la dépense en paramètre. Si la dépense est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule une nouvelle dépense ou une dépense modifiée.
   */
  private validateForGenericTable(
    gtEvent: GenericTableEntityEvent<Depense>
  ): boolean {
    if (!gtEvent) {
      throw new Error("Le paramètre 'gtEvent' est invalide");
    }

    try {
      const expense = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      if (typeof expense.annee_d === 'string') {
        // Le tableau retourne une string !
        expense.annee_d = parseInt(expense.annee_d as string, 10);
      }
      if (typeof expense.montant_d === 'string') {
        // Le tableau retourne une string !
        expense.montant_d = parseFloat(expense.montant_d as string);
      }

      const min = 2010;
      const max = new Date(Date.now()).getFullYear() + 10;
      if (
        isNaN(expense.annee_d) ||
        expense.annee_d < min ||
        expense.annee_d > max
      ) {
        const error = {
          name: this.namesMap.year.code,
          message: `L'année doit être un entier supérieure à ${
            min - 1
          } et inférieure à ${max + 1}`,
        };

        formErrors.push(error);
      }

      const isSameExpense =
        this.expenses.findIndex(
          (e) => e.annee_d === expense.annee_d && e.id_d !== expense.id_d
        ) >= 0;
      if (isSameExpense) {
        const error = {
          name: this.namesMap.year.code,
          message: "L'année doit être unique",
        };

        formErrors.push(error);
      }

      if (isNaN(expense.montant_d) || expense.montant_d <= 0) {
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
   * Ajoute une dépense au repo interne.
   * @param expense : dépense à ajouter.
   */
  private addExpense(expense: Depense): void {
    this.expenses.push(expense);
  }

  /**
   * Charge les dépenses.
   */
  private async loadData(): Promise<void> {
    try {
      this.expenses = await this.expensesSrv.getAll();
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
      const dataSource = basicSort(this.expenses, this.sortInfo);

      this.options = Object.assign({}, this.options, {
        dataSource,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
