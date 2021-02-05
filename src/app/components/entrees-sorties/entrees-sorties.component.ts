import { Component, OnInit } from '@angular/core';
import {EntreeSortie} from '../../models/entrees-sorties';
import {GenericTableOptions} from '../../shared/components/generic-table/models/generic-table-options';
import {GenericTableCellType} from '../../shared/components/generic-table/globals/generic-table-cell-types';
import {IsAdministratorGuardService} from '../../services/authentication/is-administrator-guard.service';
import {MatDialog} from '@angular/material/dialog';
import {PopupService} from '../../shared/services/popup.service';
import {EntreesSortiesService} from '../../services/entrees-sorties.service';
import {GenericTableEntityEvent} from '../../shared/components/generic-table/models/generic-table-entity-event';
import {GenericTableFormError} from '../../shared/components/generic-table/models/generic-table-entity';
import {SortInfo} from '../../shared/components/generic-table/models/sortInfo';
import {basicSort} from '../../shared/tools/utils';
import {GenericDialogComponent, IMessage} from '../../shared/components/generic-dialog/generic-dialog.component';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-entrees-sorties',
  templateUrl: './entrees-sorties.component.html',
  styleUrls: ['./entrees-sorties.component.scss']
})
export class EntreesSortiesComponent implements OnInit {
  /**
   * Titre du tableau générique.
   */
  readonly title = 'Entrées/Sorties';

  /**
   * Liste des entrées/sorties.
   */
  entreesSorties: EntreeSortie[] = [];
  /**
   *Utiliser pour le tri du tableau
   */
  private sortInfo: SortInfo;
  /**
   * Mapping pour les noms des attributs d'une entrée/sortie.
   */
  private readonly namesMap = {
    id: { code: 'id_es', name: 'Identifiant' },
    annee_recette_es: { code: 'annee_recette_es', name: 'Année de recette' },
    annee_affectation_es: { code: 'annee_affectation_es', name: 'Année d\'affectation' },
    montant_es: { code: 'montant_es', name: 'Montant affecté' },
  };

  /**
   * Représente une nouvelle entrée/sortie et définit les colonnes à afficher.
   */
  private readonly defaultEntity = {
    annee_recette_es: new Date(Date.now()).getFullYear(),
    annee_affectation_es: new Date(Date.now()).getFullYear(),
    montant_es: 0,
  } as EntreeSortie;

  /**
   * Paramètres du tableau des entrées/sorties.
   */
  options: GenericTableOptions<EntreeSortie> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      {
        code: this.namesMap.annee_recette_es.code,
        type: GenericTableCellType.NUMBER,
        name: this.namesMap.annee_recette_es.name,
        sortEnabled: true,
      },
      {
        code: this.namesMap.annee_affectation_es.code,
        type: GenericTableCellType.NUMBER,
        name: this.namesMap.annee_affectation_es.name,
        sortEnabled: true,
      },
      {
        code: this.namesMap.montant_es.code,
        type: GenericTableCellType.CURRENCY,
        name: this.namesMap.montant_es.name,
        sortEnabled: false,
      }
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: [],
    sortName: this.namesMap.annee_affectation_es.name,
    sortDirection: 'desc',
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
  constructor(
    private adminSrv: IsAdministratorGuardService,
    private dialog: MatDialog,
    private popupService: PopupService,
    private entreesSortiesService: EntreesSortiesService
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      await this.loadData();
      this.refreshDataTable();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Charge les entrées/sorties.
   */
  private async loadData(): Promise<void> {
    try {
      this.entreesSorties = await this.entreesSortiesService.getAll();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
  /**
   * Une entrée/sortie a été ajouter au tableau.
   * @param event : encapsule l'entrée/sortie à ajouter.
   */
  public async onCreate(event: GenericTableEntityEvent<EntreeSortie>): Promise<void> {
    try {
      let inOut = event.entity;
      if (!inOut) {
        throw new Error("L'entrée/sortie n'existe pas");
      }
      if (this.validateForGenericTable(event, false)) {
        inOut = await this.entreesSortiesService.add(inOut);
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.addInOut(inOut);
        this.refreshDataTable();
        this.popupService.success(
          `L'entrée/sortie avec l'année d'affectation ${inOut.annee_affectation_es} a été créé.`
        );
      }
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de créer l\'entrée/sortie : ' + error.message
      );
    }
  }
  /**
   * Une entrée/sortie a été modifié dans le tableau.
   * @param event : encapsule l'entrée/sortie à modifier.
   */
  public async onEdit(event: GenericTableEntityEvent<EntreeSortie>): Promise<void> {
    try {
      let inOut = event.entity;
      if (!inOut) {
        throw new Error("L'entrée/sortie n'existe pas");
      }
      if (this.validateForGenericTable(event, false)) {
        inOut = await this.entreesSortiesService.modify(inOut);
        this.updateInOut(inOut);
        this.refreshDataTable(); // Pour le trie
        this.popupService.success(
          `L'entrée sortie avec l'année d'affectation ${inOut.annee_affectation_es} a été modifiée.`
        );
      }
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de modifier l\'entrée/sortie : ' + error.message
      );
    }
  }
  /**
   * Une entrée/sortie a été supprimer du tableau.
   * @param event : encapsule l'entrée/sortie à supprimer.
   */
  public async onDelete(event: GenericTableEntityEvent<EntreeSortie>): Promise<void> {
    try {
      const inOut = event?.entity;
      if (!inOut) {
        throw new Error('L\'entrée/sortie n\'existe pas');
      }
      const data: IMessage = {
        header: 'Suppression de l\'entrée/sortie',
        content: `Vous vous apprêtez à supprimer l'entrée/sortie de l'année d'affectation ${inOut.annee_affectation_es}. Etes-vous certain de vouloir la supprimer ?`,
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
        await this.entreesSortiesService.delete(inOut);
        event.callBack(null); // Valide la modification dans le composant DataTable fils
        this.deleteInOut(inOut);
        this.refreshDataTable();
        this.popupService.success(
          `L'entrée/sortie avec l'année d'affectation ${inOut.annee_affectation_es} a été supprimée.`
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
   * Vérifie la validité de l'entrée/sortie en paramètre. Si l'entrée/sortie est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule une nouvelle l'entrée/sortie ou une l'entrée/sortie modifiée.
   * @param create : s'il s'agit d'un create ou d'un modify
   */
  private validateForGenericTable(gtEvent: GenericTableEntityEvent<EntreeSortie>, create: boolean): boolean {
    if (!gtEvent) {
      throw new Error('Le paramètre \'gtEvent\' est invalide');
    }
    try {
      const inOut = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];
      this.verifForms(inOut, formErrors, create);
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
   * Vérifie le forms de l'entrée/sortie
   * @param inout : l'entrée/sortie à vérifier.
   * @param formErrors : liste des erreurs de validation.
   * @param create : s'il s'agit d'un create ou d'un modify
   */
  private verifForms(inout: EntreeSortie, formErrors: GenericTableFormError[], create: boolean): void {
    if (!inout.annee_affectation_es) {
      const error = {
        name: this.namesMap.annee_affectation_es.code,
        message: "Une année d 'affectation doit être définie.",
      };
      formErrors.push(error);
    }
    if (!inout.annee_recette_es) {
      const error = {
        name: this.namesMap.annee_recette_es.code,
        message: "Une année de recette doit être définie.",
      };
      formErrors.push(error);
    }
    if (!inout.montant_es) {
      const error = {
        name: this.namesMap.montant_es.code,
        message: "Un montant doit être défini.",
      };
      formErrors.push(error);
    }
    if(this.verifUniqueYears(inout, create)){
      const error = {
        name: this.namesMap.annee_recette_es.code,
        message: "Le couple (année recette, année affectation) existe déjà.",
      };
      formErrors.push(error);
    }
  }
  /**
   * Vérifie l'unicité du couple (anner_r,annee_a) d'une entrée/sortie
   * @param inOut : l'entrée/sortie à vérifier.
   * @param create : s'il s'agit d'une création ou d'une modification
   */
  private verifUniqueYears(inOut: EntreeSortie, create: boolean): boolean {
    console.log("Create : " , create);
    if(create){
      const index = this.entreesSorties.findIndex
      ((p) => (p.annee_affectation_es === inOut.annee_affectation_es && p.annee_recette_es === inOut.annee_recette_es));
      if (index >= 0) {
        return true;
      }
    }
    if(!create){
      const index = this.entreesSorties.findIndex
      ((p) => (p.id_es != inOut.id_es && p.annee_affectation_es === inOut.annee_affectation_es && p.annee_recette_es === inOut.annee_recette_es));
      if (index >= 0) {
        return true;
      }
    }
    return false;
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

  private refreshDataTable(): void {
    this.options = {
      ...this.options,
      dataSource: basicSort(this.entreesSorties, this.sortInfo),
    };
  }

  /**
   * Ajoute une entrée/sortie au repo interne.
   * @param inOut : entrée/sortie à ajouter.
   */
  private addInOut(inOut: EntreeSortie): void {
    this.entreesSorties.push(inOut);
  }

  /**
   * Met à jour une entrée/sortie dans le repo interne.
   * @param inOut : version modifiée.
   */
  private updateInOut(inOut: EntreeSortie): void {
    const index = this.entreesSorties.findIndex((p) => p.id_es === inOut.id_es);

    if (index >= 0) {
      this.entreesSorties[index] = inOut;
    }
  }

  /**
   * Supprime une entrée/sortie dans le repo interne.
   * @param inOut : entrée/sortie à supprimer.
   */
  private deleteInOut(inOut: EntreeSortie): void {
    const index = this.entreesSorties.findIndex((p) => p.id_es === inOut.id_es);

    if (index >= 0) {
      this.entreesSorties.splice(index, 1);
    }
  }

}
