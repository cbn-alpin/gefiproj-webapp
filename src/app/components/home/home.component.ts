import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UsersService } from 'src/app/services/users.service';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableFormError } from 'src/app/shared/components/generic-table/models/generic-table-entity';
import { SortInfo } from 'src/app/shared/components/generic-table/models/sortInfo';
import { ProjetsService } from '../../services/projets.service';
import { Projet } from './../../models/projet';
import { Utilisateur } from './../../models/utilisateur';
import { GenericTableEntityEvent } from './../../shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from './../../shared/components/generic-table/models/generic-table-options';

/**
 * Affiche les projets.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  /**
   * Titre du tableau générique.
   */
  readonly title = 'Projets';

  /**
   * Indique s'il faut afficher les projets soldés.
   */
  // tslint:disable-next-line: variable-name
  _withClosedProjects = false;

  /**
   * Indique s'il faut afficher les projets soldés.
   */
  public get withClosed(): boolean {
    return this._withClosedProjects;
  }

  /**
   * Indique s'il faut afficher les projets soldés.
   * @param isVisible : true ssi les projets soldés doivent être affichés.
   */
  public set withClosed(isVisible: boolean) {
    try {
      this._withClosedProjects = !!isVisible;

      this.refreshDataTable();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Liste des projets.
   */
  projets: Projet[] = [];

  /**
   * Projets non soldés.
   */
  private get projectsNonClosed(): Projet[] {
    return (this.projets || [])
      .filter(p => !p.statut_p);
  }

  /**
   * Projets visibles.
   */
  private get visibleProjects(): Projet[] {
    return this._withClosedProjects
      ? this.projets || []
      : this.projectsNonClosed;
  }

  /**
   * Responsables des projets.
   */
  managers: Utilisateur[];

  /**
   * Mapping pour les noms des attributs d'un projet.
   */
  private readonly namesMap = {
    id: { code: 'id_p', name: 'Identifiant' },
    code: { code: 'code_p', name: 'Code' },
    name: { code: 'nom_p', name: 'Nom' },
    manager: { code: 'responsable', name: 'Responsable' },
    status: { code: 'statut_p', name: 'Est soldé' }
  };

  /**
   * Représente un nouveau projet et définit les colonnes à afficher.
   */
  private readonly defaultEntity = {
    code_p: 0,
    nom_p: '',
    responsable: '',
    statut_p: false
  } as Projet;

  /**
   * Paramètres du tableau de projets.
   */
  options: GenericTableOptions<Projet> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      { code: this.namesMap.code.code, type: GenericTableCellType.NUMBER, name: this.namesMap.code.name, sortEnabled: true },
      { code: this.namesMap.name.code, type: GenericTableCellType.TEXT, name: this.namesMap.name.name, sortEnabled: true },
      { code: this.namesMap.manager.code, type: GenericTableCellType.SELECTBOX, name: this.namesMap.manager.name, sortEnabled: true },
      { code: this.namesMap.status.code, type: GenericTableCellType.BOOLEAN, name: this.namesMap.status.name, sortEnabled: true }
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: [],
    sortName: this.namesMap.code.name,
    sortDirection: 'asc'
  };

  /**
   * Indique si le tableau peut-être modifié.
   */
  public get showActions(): boolean {
    return !!this.adminSrv.isAdministrator;
  }

  /**
   * Indique le trie courant.
   */
  sortInfo: SortInfo;

  /**
   * Affiche les projets.
   * @param adminSrv : permet de vérifier si l'utilisateur est un administrateur.
   * @param projectsSrv : permet de dialoguer avec le serveur d'API pour les entités Projet.
   * @param usersSrv : permet de charger les utilisateurs.
   * @param snackBar : affiche une information.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private adminSrv: IsAdministratorGuardService,
    private projectsSrv: ProjetsService,
    private usersSrv: UsersService,
    private snackBar: MatSnackBar,
    private spinnerSrv: SpinnerService) {
  }

  /**
   * Initialise le composant.
   */
  async ngOnInit(): Promise<void> {
    try {
      const promiseManagers = this.loadManagers();
      const promiseProjects =  this.loadProjects();
      await Promise.all([promiseManagers, promiseProjects]); // Pour être plus efficace
      const dataSource = this.sort(this.visibleProjects);
      const entitySelectBoxOptions = [
        {
          name: this.namesMap.manager.code,
          values: this.managers?.map(u => u.initiales_u) || []
        }
      ];

      this.options = Object.assign({}, this.options, {
        dataSource,
        entitySelectBoxOptions
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Charge les responsables depuis le serveur.
   */
  async loadManagers(): Promise<Utilisateur[]> {
    try {
      this.spinnerSrv.show();
      this.managers =  await this.usersSrv.getAll();
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de charger les responsables de projet.');
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Charge les projets depuis le serveur.
   */
  async loadProjects(): Promise<void> {
    try {
      this.spinnerSrv.show();
      this.projets = await this.projectsSrv.getAll();
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de charger les projets.');
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Affiche une information.
   * @param message : message à afficher.
   */
  private showInformation(message: string): void {
    try {
      this.snackBar.open(
        message,
        'OK', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Met à jour les données d'affichage.
   */
  private refreshDataTable(): void {
    try {
      const dataSource = this.sort(this.visibleProjects);

      this.options = Object.assign({}, this.options, {
        dataSource
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Un projet a été modifié dans le tableau.
   * @param event : encapsule le projet à modifier.
   */
  async onEdit(event: GenericTableEntityEvent<Projet>): Promise<void> {
    try {
      const project = event?.entity;
      if (!project) {
        throw new Error('Le projet n\'existe pas');
      }

      if (this.validateForGenericTable(event)) {
        await this.projectsSrv.modify(project);
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.updateProject(project);
        this.refreshDataTable(); // Pour le trie et pour cacher le projet le cas échéant
      }
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de modifier le projet.'
      });
    }
  }

  /**
   * Met à jour un projet dans le repo interne.
   * @param project : version modifiée.
   */
  private updateProject(project: Projet): void {
    const index = this.projets.findIndex(p => p.id_p === project.id_p);

    if (index >= 0) {
      this.projets[index] = project;
    }
  }

  /**
   * Vérifie la validité du projet en paramètre. Si le projet est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule un nouveau projet ou un projet modifié.
   */
  private validateForGenericTable(gtEvent: GenericTableEntityEvent<Projet>): boolean {
    if (!gtEvent) {
      throw new Error('Le paramètre \'gtEvent\' est invalide');
    }

    try {
      const project = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      if (project.code_p <= 0) {
        const error = {
          name: this.namesMap.code.code,
          message: 'Le code projet doit être une valeur comprise entre 1 et 9999.'
        };
        formErrors.push(error);
      }

      if (!project.nom_p) {
        const error = {
          name: this.namesMap.name.code,
          message: 'Le nom du projet doit être indiqué.'
        };
        formErrors.push(error);
      }

      if (!project.responsable) {
        const error = {
          name: this.namesMap.manager.code,
          message: 'Un responsable projet doit être défini.'
        };
        formErrors.push(error);
      }

      if (formErrors.length > 0) {
        gtEvent.callBack({
          formErrors
        });

        this.showInformation('Veuillez vérifier vos données');
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
   * Un projet a été créé et initialisé dans le tableau.
   * @param event : encapsule le projet à ajouter.
   */
  async onCreate(event: GenericTableEntityEvent<Projet>): Promise<void> {
    try {
      let project = event?.entity;
      if (!project) {
        throw new Error('Le projet n\'existe pas');
      }

      if (this.validateForGenericTable(event)) {
        project = await this.projectsSrv.add(event.entity);
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.addProject(project);
        this.refreshDataTable(); // Pour le trie et pour cacher le projet le cas échéant
      }
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de créer le projet.'
      });
    }
  }

  /**
   * Ajoute un projet au repo interne.
   * @param project : projet à ajouter.
   */
  private addProject(project: Projet): void {
    this.projets.push(project);
  }

  /**
   * Un projet a été supprimé du tableau.
   * @param event : encapsule le projet à modifier.
   */
  async onDelete(event: GenericTableEntityEvent<Projet>): Promise<void> {
    try {
      const project = event?.entity;
      if (!project) {
        throw new Error('Le projet n\'existe pas');
      }

      await this.projectsSrv.delete(event.entity);
      event.callBack(null); // Valide la modification dans le composant DataTable fils
      this.deleteProject(project);
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de supprimer le projet.'
      });
    }
  }

  /**
   * Supprime un projet dans le repo interne.
   * @param project : projet à supprimer.
   */
  private deleteProject(project: Projet): void {
    const index = this.projets.findIndex(p => p.id_p === project.id_p);

    if (index >= 0) {
      this.projets.splice(index, 1);
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
   * Trie les projets en paramètre.
   * @param projects : projets à trier.
   */
  private sort(projects: Projet[]): Projet[] {
    const { name, direction } = this.sortInfo || {
      name: this.namesMap.code.code,
      direction: 'asc'
    };
    const mult = direction === 'asc' // Pour gérer le sens du trie
      ? 1
      : -1;

    return projects.sort((p1, p2) => {
      let item1 = p1[name];
      let item2 = p2[name];

      if (name === this.namesMap.code.code) { // Les codes sont des entiers
        item1 = parseInt(item1, 10);
        item2 = parseInt(item2, 10);
      } else if (typeof item1 === 'string'){ // Pour du texte
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
