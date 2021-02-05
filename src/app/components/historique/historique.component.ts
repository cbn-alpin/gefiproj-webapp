import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableOptions } from 'src/app/shared/components/generic-table/models/generic-table-options';
import { SortInfo } from 'src/app/shared/components/generic-table/models/sortInfo';
import { PopupService } from 'src/app/shared/services/popup.service';
import { basicSort } from 'src/app/shared/tools/utils';
import { Historique } from './../../models/historique';
import { HistoricalService } from './../../services/historical.service';

interface HistoriqueEvo extends Historique {
  initiales_u: string;
  code_p: number;
  nom_p: string;
  message: string;
  typeModif: 'Ajout' | 'Modification' | 'Suppression' | string;
  entity: 'Projet' | 'Financement' | 'Recette' | 'Affectation' | string;
}

interface MessageInModification {
  version?: number;
  modification?: 'C' | 'U' | 'D';
  table?: 'P' | 'F' | 'R' | 'A';
  message?: string;
}

/**
 * Affiche l'historique des modifications'.
 */
@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class HistoriqueComponent implements OnInit {
  /**
   * Titre du tableau générique.
   */
  public readonly title = 'Historique des modifications';

  /**
   * Liste des dépenses.
   */
  public expenses: HistoriqueEvo[] = [];

  /**
   * Mapping pour les noms des attributs d'une dépense.
   */
  private readonly namesMap = {
    id: { code: 'id_h', name: 'Identifiant' },
    initiales: { code: 'initiales', name: 'Modificateur' },
    projectName: { code: 'nom_p', name: 'Nom du projet' },
    projectCode: { code: 'code_p', name: 'Code du projet' },
    date: { code: 'date_h', name: 'Date' },
    message: { code: 'message', name: 'Description' },
  };

  /**
   * Paramètres du tableau des dépenses.
   */
  public options: GenericTableOptions<Historique> = {
    dataSource: [],
    defaultEntity: {} as HistoriqueEvo,
    entityTypes: [
      {
        code: this.namesMap.initiales.code,
        type: GenericTableCellType.TEXT,
        name: this.namesMap.initiales.name,
        sortEnabled: true
      },
      {
        code: this.namesMap.projectName.code,
        type: GenericTableCellType.TEXT,
        name: this.namesMap.projectName.name,
        sortEnabled: true
      },
      {
        code: this.namesMap.projectCode.code,
        type: GenericTableCellType.NUMBER,
        name: this.namesMap.projectCode.name,
        sortEnabled: true
      },
      {
        code: this.namesMap.date.code,
        type: GenericTableCellType.DATE,
        name: this.namesMap.date.name,
        sortEnabled: true
      },
      {
        code: this.namesMap.message.code,
        type: GenericTableCellType.TEXT,
        name: this.namesMap.message.name,
        sortEnabled: false
      },
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: [],
    sortName: this.namesMap.date.name,
    sortDirection: 'desc',
  };

  /**
   * Indique le trie courant.
   */
  public sortInfo: SortInfo;

  /**
   * Affiche les dépenses.
   * @param dialog : affiche une boîte de dialogue.
   * @param popupService : affiche une information.
   * @param expensesSrv : permet de charger les dépenses.
   */
  constructor(
    private dialog: MatDialog,
    private popupService: PopupService,
    private expensesSrv: HistoricalService
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
   * Charge les dépenses.
   */
  private async loadData(): Promise<void> {
    try {
      const modifications = await this.expensesSrv.getAll();
      this.expenses = modifications?.map(modification =>
        this.InjectProperties(modification)) || [];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  private InjectProperties(modification: Historique): HistoriqueEvo {
    const message: MessageInModification = JSON.parse(modification.description_h || '{}') || {};
    const typesModif = ['Non déterminé', 'Ajout', 'Modification', 'Suppression'];
    const indexTypeModif = ['C', 'D', 'U'].indexOf(message.modification || 'M') + 1;
    const entities = ['Non déterminé', 'Projet', 'Financement', 'Recette', 'Affectation'];
    const indexEntity = ['P', 'F', 'R', 'A'].indexOf(message.modification || 'M') + 1;

    return Object.assign({
      initiales_u: modification.user?.initiales_u || '',
      nom_p: modification.project?.nom_p || '',
      code_p: modification.project?.code_p || '',
      message: message.message,
      typeModif: typesModif[indexTypeModif],
      entity: entities[indexEntity]
    }, modification) as HistoriqueEvo;
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
