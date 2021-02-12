import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
import { FinanceurService as FundersService } from 'src/app/services/funders.service';
import {
  GenericDialogComponent,
  IMessage,
} from 'src/app/shared/components/generic-dialog/generic-dialog.component';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableFormError } from 'src/app/shared/components/generic-table/models/generic-table-entity';
import { GenericTableEntityEvent } from 'src/app/shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from 'src/app/shared/components/generic-table/models/generic-table-options';
import { SortInfo } from 'src/app/shared/components/generic-table/models/sortInfo';
import { Financeur } from './../../models/financeur';
import { PopupService } from './../../shared/services/popup.service';
import { basicSort } from '../../shared/tools/utils';

/**
 * Affiche les financeurs.
 */
@Component({
  selector: 'app-financeurs',
  templateUrl: './financeurs.component.html',
  styleUrls: ['./financeurs.component.scss'],
})
export class FinanceursComponent implements OnInit {
  /**
   * Titre du tableau générique.
   */
  readonly title = 'Financeurs';

  /**
   * Liste des financeurs.
   */
  funders: Financeur[] = [];

  /**
   * Mapping pour les noms des attributs d'un financeur.
   */
  private readonly namesMap = {
    id: { code: 'id_d', name: 'Identifiant' },
    name: { code: 'nom_financeur', name: 'Nom' },
    ref: {
      code: 'ref_arret_attributif_financeur',
      name: "Ref de l'arrêté attributif",
    },
  };

  /**
   * Représente un nouveau financeur et définit les colonnes à afficher.
   */
  private readonly defaultEntity = {
    nom_financeur: '',
    ref_arret_attributif_financeur: '',
  } as Financeur;

  /**
   * Paramètres du tableau des financeurs.
   */
  options: GenericTableOptions<Financeur> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      {
        code: this.namesMap.name.code,
        type: GenericTableCellType.TEXT,
        name: this.namesMap.name.name,
        sortEnabled: true,
        isMandatory: true,
      },
      {
        code: this.namesMap.ref.code,
        type: GenericTableCellType.TEXT,
        name: this.namesMap.ref.name,
        sortEnabled: false,
      },
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: [],
    sortName: this.namesMap.name.name,
    sortDirection: 'asc',
    idPropertyName: this.namesMap.id.code,
  };

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
   * Affiche les financeurs.
   * @param adminSrv : permet de vérifier si l'utilisateur est un administrateur.
   * @param dialog : affiche une boîte de dialogue.
   * @param popupService : affiche une information.
   * @param fundersSrv : permet de charger les financeurs.
   */
  constructor(
    private adminSrv: IsAdministratorGuardService,
    private dialog: MatDialog,
    private popupService: PopupService,
    private fundersSrv: FundersService
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
   * Un financeur a été créé et initialisé dans le tableau.
   * @param event : encapsule le financeur à ajouter.
   */
  async onCreate(event: GenericTableEntityEvent<Financeur>): Promise<void> {
    try {
      let funder = event?.entity;
      if (!funder) {
        throw new Error("Le financeur n'existe pas");
      }

      if (this.validateForGenericTable(event)) {
        funder = await this.fundersSrv.add(funder);
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.addFunder(funder);
        this.refreshDataTable(); // Pour le trie
        this.popupService.success(
          `Le financeur \'${funder.nom_financeur}\' a été cré.`
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
   * Un financeur a été modifié dans le tableau.
   * @param event : encapsule le financeur à modifier.
   */
  async onEdit(event: GenericTableEntityEvent<Financeur>): Promise<void> {
    try {
      let funder = event?.entity;
      if (!funder) {
        throw new Error("Le financeur n'existe pas");
      }

      if (this.validateForGenericTable(event)) {
        funder = await this.fundersSrv.modify(funder);
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.updateFunder(funder);
        this.refreshDataTable(); // Pour le trie
        this.popupService.success(
          `Le financeur \'${funder.nom_financeur}\' a été modifié.`
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
   * Un financeur a été supprimé du tableau.
   * @param event : encapsule le financeur à supprimer.
   */
  async onDelete(event: GenericTableEntityEvent<Financeur>): Promise<void> {
    try {
      const funder = event?.entity;
      if (!funder) {
        throw new Error("Le financeur n'existe pas");
      }

      // RG
      const fundings = (await this.fundersSrv.getFundings(funder)) || [];
      const isEmpty = fundings.length === 0;
      if (!isEmpty) {
        event?.callBack({
          apiError:
            'Impossible de supprimer le financeur car il possède des financements.',
        });
        return;
      }

      // Etes-vous sûr ?
      const data: IMessage = {
        header: 'Suppression du financeur',
        content: `Vous vous apprêtez à supprimer le financeur \'${funder.nom_financeur}\'. Etes-vous certain de vouloir le supprimer ?`,
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
        await this.fundersSrv.delete(funder);
        event.callBack(null); // Valide la modification dans le composant DataTable fils
        this.deleteFunder(funder);
        this.refreshDataTable();
        this.popupService.success(
          `Le financeur \'${funder.nom_financeur}\' a été supprimé.`
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
   * Supprime un financeur dans le repo interne.
   * @param funder : financeur à supprimer.
   */
  private deleteFunder(funder: Financeur): void {
    const index = this.funders.findIndex(
      (p) => p.id_financeur === funder.id_financeur
    );

    if (index >= 0) {
      this.funders.splice(index, 1);
    }
  }

  /**
   * Met à jour un financeur dans le repo interne.
   * @param funder : version modifiée.
   */
  private updateFunder(funder: Financeur): void {
    const index = this.funders.findIndex(
      (p) => p.id_financeur === funder.id_financeur
    );

    if (index >= 0) {
      this.funders[index] = funder;
    }
  }

  /**
   * Vérifie la validité du financeur en paramètre. Si le financeur est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule un nouveau financeur ou un financeur modifié.
   */
  private validateForGenericTable(
    gtEvent: GenericTableEntityEvent<Financeur>
  ): boolean {
    if (!gtEvent) {
      throw new Error("Le paramètre 'gtEvent' est invalide");
    }

    try {
      const funder = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      if (!funder?.nom_financeur || funder.nom_financeur.length === 0) {
        const error = {
          name: this.namesMap.name.code,
          message: 'Le nom du financeur ne pas être vide',
        };

        formErrors.push(error);
      }

      const isSameFunder =
        this.funders.findIndex(
          (f) =>
            f.nom_financeur === funder.nom_financeur &&
            f.id_financeur !== funder.id_financeur
        ) >= 0;
      if (isSameFunder) {
        const error = {
          name: this.namesMap.name.code,
          message: 'Le nom du financeur doit être unique',
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
   * Ajoute un financeur au repo interne.
   * @param funder : financeur à ajouter.
   */
  private addFunder(funder: Financeur): void {
    this.funders.push(funder);
  }

  /**
   * Charge les financeurs.
   */
  private async loadData(): Promise<void> {
    try {
      this.funders = await this.fundersSrv.getAll();
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
      const dataSource = basicSort(this.funders, this.sortInfo);

      this.options = Object.assign({}, this.options, {
        dataSource,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
