import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
import { ExpensesService } from 'src/app/services/expenses.service';
import { GenericDialogComponent, IMessage } from 'src/app/shared/components/generic-dialog/generic-dialog.component';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableFormError } from 'src/app/shared/components/generic-table/models/generic-table-entity';
import { GenericTableEntityEvent } from 'src/app/shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from 'src/app/shared/components/generic-table/models/generic-table-options';
import { SortInfo } from 'src/app/shared/components/generic-table/models/sortInfo';
import { PopupService } from 'src/app/shared/services/popup.service';
import { Depense } from './../../models/depense';

/**
 * Affiche les dépenses.
 */
@Component({
  selector: 'app-depenses',
  templateUrl: './depenses.component.html',
  styleUrls: ['./depenses.component.scss']
})
export class DepensesComponent implements OnInit {
  /**
   * Titre du tableau générique.
   */
  readonly title = 'Dépenses';

  /**
   * Liste des dépenses.
   */
  expenses: Depense[];

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
  options: GenericTableOptions<Depense> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      {
        code: this.namesMap.year.code,
        type: GenericTableCellType.NUMBER,
        name: this.namesMap.year.name,
        sortEnabled: true,
      },
      {
        code: this.namesMap.amount.code,
        type: GenericTableCellType.NUMBER,
        name: this.namesMap.amount.name,
        sortEnabled: false,
      }
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: [],
    sortName: this.namesMap.year.name,
    sortDirection: 'desc'
  };

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

  /**
   * Indique le trie courant.
   */
  sortInfo: SortInfo;

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
  ) { }

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
        throw new Error('La dépense n\'existe pas');
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
        apiError: 'Impossible de créer la dépense.',
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
        throw new Error('La dépense n\'existe pas');
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
        apiError: 'Impossible de modifiée la dépense.',
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
        throw new Error('La dépense n\'existe pas');
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

      if (okToDelete) { // Suppression
        await this.expensesSrv.delete(expense);
        event.callBack(null); // Valide la modification dans le composant DataTable fils
        this.deleteExpense(expense);
        this.refreshDataTable();
        this.popupService.success(
          `La dépense de l'année ${expense.annee_d} a été supprimée.`
        );
      } else { // Annulation
        event?.callBack({
          apiError: 'La suppression est annulée.',
        });
      }
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de supprimer la dépense.',
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
   * @param expense : version modifiée.
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
      throw new Error('Le paramètre \'gtEvent\' est invalide');
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

      const min = 2020;
      const max = new Date(Date.now()).getFullYear() + 10;
      if (isNaN(expense.annee_d) || expense.annee_d < min || expense.annee_d > max) {
        const error = {
          name: this.namesMap.year.code,
          message: `L'année doit être un entier supérieure à ${min - 1} et inférieure à ${max + 1}`,
        };

        formErrors.push(error);
      }

      const isSameExpense = this.expenses.findIndex(e => e.annee_d === expense.annee_d && e.id_d !== expense.id_d) >= 0;
      if (isSameExpense) {
        const error = {
          name: this.namesMap.year.code,
          message: 'L\'année doit être unique',
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
   * @param project : dépense à ajouter.
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
      const dataSource = this.sort();

      this.options = Object.assign({}, this.options, {
        dataSource,
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Trie les dépenses en paramètre.
   */
  private sort(): Depense[] {
    const { name, direction } = this.sortInfo || {
      name: this.namesMap.year.code,
      direction: 'desc',
    };
    const mult =
      direction === 'asc' // Pour gérer le sens du trie
        ? 1
        : -1;

    return this.expenses.sort((p1, p2) => {
      let item1 = p1[name];
      let item2 = p2[name];

      if (typeof item1 === 'string') {
        // Pour du texte
        item1 = item1.toUpperCase();
        item2 = item2.toUpperCase();
      }

      if (item1 < item2) {
        return -1 * mult;
      }
      if (item1 > item2) {
        return 1 * mult;
      }
      return 0;
    });
  }
}
