import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UsersService } from 'src/app/services/users.service';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { EntitySelectBoxOptions } from 'src/app/shared/components/generic-table/models/entity-select-box-options';
import { GenericTableFormError } from 'src/app/shared/components/generic-table/models/generic-table-entity';
import { SelectBoxOption } from 'src/app/shared/components/generic-table/models/SelectBoxOption';
import { SortInfo } from 'src/app/shared/components/generic-table/models/sortInfo';
import { ProjetsService } from '../../services/projets.service';
import { Projet } from './../../models/projet';
import { Utilisateur } from './../../models/utilisateur';
import { GenericTableEntityEvent } from './../../shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from './../../shared/components/generic-table/models/generic-table-options';
import {Router} from "@angular/router";

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
    managerId: { code: 'id_u', name: 'Id responsable' },
    managerLabel: { code: 'initiales_u', name: 'Responsable' },
    status: { code: 'statut_p', name: 'Est soldé' }
  };

  /**
   * Représente un nouveau projet et définit les colonnes à afficher.
   */
  private readonly defaultEntity = {
    code_p: '0000' as any as number,
    nom_p: '',
    id_u: 0,
    statut_p: false
  } as Projet;

  /**
   * Paramètres du tableau de projets.
   */
  options: GenericTableOptions<Projet> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      { code: this.namesMap.code.code,
        type: GenericTableCellType.NUMBER, name: this.namesMap.code.name, sortEnabled: true },
      { code: this.namesMap.name.code,
        type: GenericTableCellType.TEXT, name: this.namesMap.name.name, sortEnabled: true },
      { code: this.namesMap.managerId.code,
        type: GenericTableCellType.SELECTBOX, name: this.namesMap.manager.name, sortEnabled: true },
      { code: this.namesMap.status.code,
        type: GenericTableCellType.BOOLEAN, name: this.namesMap.status.name, sortEnabled: true }
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: [],
    sortName: this.namesMap.code.name,
    sortDirection: 'asc',
    navigationUrlFt: project => `projet/${project?.id_p || 0}`
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
    private spinnerSrv: SpinnerService,
    private router: Router
    ) {
  }

  /**
   * Initialise le composant.
   */
  async ngOnInit(): Promise<void> {
    try {
      await this.loadData();
      this.initDtOptions();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Initialise les options de la table générique.
   */
  private initDtOptions(): void {
    const dataSource = this.sort(this.visibleProjects);
    const userSelectBoxOption: EntitySelectBoxOptions<Utilisateur> = {
      name: this.namesMap.managerId.code,
      values: this.managers?.map<SelectBoxOption<Utilisateur>>(u => this.transformToSbOption(u)
      ) || []
    };
    const entitySelectBoxOptions = [
      userSelectBoxOption
    ];

    this.options = Object.assign({}, this.options, {
      dataSource,
      entitySelectBoxOptions
    });
  }

  /**
   * Charge les données : projets et responsables.
   */
  private async loadData(): Promise<void> {
    const promiseManagers = this.loadManagers();
    const promiseProjects = this.loadProjects();
    await Promise.all([promiseManagers, promiseProjects]); // Pour être plus efficace : les requêtes sont lancées en parallèle
  }

  /**
   * Transforme l'utilisateur en option utilisable dans la table générique.
   * @param user : utilisateur à encapsulée.
   */
  private transformToSbOption(user: Utilisateur): SelectBoxOption<Utilisateur> {
    return {
      id: user?.id_u || 0,
      label: user?.initiales_u || '',
      item: user || null
    };
  }

  /**
   * Charge les responsables depuis le serveur.
   */
  async loadManagers(): Promise<Utilisateur[]> {
    try {
      this.spinnerSrv.show();
      this.managers =  (await this.usersSrv.getAll()) // RG : tous les utilisateurs actifs peuvent être responsable projets
        .filter(m => m.active_u);
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
      this.projets = (await this.projectsSrv.getAll()) || [];
      this.projets.forEach(p => {
        p.id_u = p.id_u || p.responsable?.id_u || 0;
        p.responsable = p.responsable || this.managers.find(m => m.id_u === p.id_u) || null;
        p[this.namesMap.managerLabel.code] = p.responsable?.initiales_u || ''; // Pour le trie
      });
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

      this.injectManager(project);

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

      this.verifProjectCode(project, formErrors);
      this.verifProjectName(project, formErrors);
      this.verifProjectManager(project, formErrors);

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
   * Vérifie la validité du responsable sur le projet.
   * @param project : projet à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifProjectManager(project: Projet, formErrors: GenericTableFormError[]): void {
    if (!project.responsable) {
      const error = {
        name: this.namesMap.managerId.code,
        message: 'Un responsable projet doit être défini.'
      };

      formErrors.push(error);
    }
  }

  /**
   * Vérifie la validité du nom sur le projet.
   * @param project : projet à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifProjectName(project: Projet, formErrors: GenericTableFormError[]): void {
    if (!project.nom_p) {
      const error = {
        name: this.namesMap.name.code,
        message: 'Le nom du projet doit être indiqué.'
      };

      formErrors.push(error);
    }

    if (project.nom_p.length < 3) {
      const error = {
        name: this.namesMap.name.code,
        message: 'Le nom du projet doit avoir au moins 3 caractères.'
      };

      formErrors.push(error);
    }

    const similarProject = this.projets.find(p =>
      p.id_p !== project.id_p
      && p.nom_p.toUpperCase() === project.nom_p.toUpperCase());

    if (similarProject) {
      const error = {
        name: this.namesMap.name.code,
        message: 'Le nom du projet doit être unique.'
      };

      formErrors.push(error);
    }
  }

  /**
   * Vérifie la validité du code sur le projet.
   * @param project : projet à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifProjectCode(project: Projet, formErrors: GenericTableFormError[]): void {
    if (('' + project.code_p).length !== 4) {
      const error = {
        name: this.namesMap.code.code,
        message: 'Le code projet doit comprendre 4 chiffres.'
      };

      formErrors.push(error);
    }

    if (project.code_p <= 0) {
      const error = {
        name: this.namesMap.code.code,
        message: 'Le code projet doit être une valeur comprise entre 1 et 9999.'
      };

      formErrors.push(error);
    }

    const similarProject = this.projets.find(p =>
      p.id_p !== project.id_p
      && p.code_p === project.code_p);

    if (similarProject) {
      const error = {
        name: this.namesMap.code.code,
        message: 'Le code du projet doit être unique.'
      };

      formErrors.push(error);
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

      this.injectManager(project);

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
   * Détermine le responsable à partir de son identifiant.
   * @param project : projet concerné.
   */
  private injectManager(project: Projet): void {
    try {
      if (project.id_u > 0) {
        project.responsable = this.managers
          .find(m => m.id_u === project.id_u) || null;
        project[this.namesMap.managerLabel.code] = project.responsable?.initiales_u || ''; // Pour le trie
      }
    } catch (error) {
      console.error(error);
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

      // Vérification des RG
      const fundings = (await this.projectsSrv.getFundings(project)) || [];
      const isEmpty = fundings.length === 0;

      if (!isEmpty) { // RG : Ne pas supprimer un projet avec des financements
        event?.callBack({
          apiError: 'Impossible de supprimer le projet car il possède des financements.'
        });
        return;
      }

      // Etes-vous sûr ?
      const okToDelete = confirm(`Vous vous apprêtez à supprimer le projet \'${project.nom_p} (${project.code_p})\'. Etes-vous certain de vouloir le supprimer ?`);

      if (okToDelete) { // Suppression
        await this.projectsSrv.delete(project);
        event.callBack(null); // Valide la modification dans le composant DataTable fils
        this.deleteProject(project);
      } else { // Annulation
        event?.callBack({
          apiError: 'La suppression est annulée.'
        });
      }
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
    // tslint:disable-next-line: prefer-const
    let { name, direction } = this.sortInfo || {
      name: this.namesMap.code.code,
      direction: 'asc'
    };
    const mult = direction === 'asc' // Pour gérer le sens du trie
      ? 1
      : -1;

    if (name === this.namesMap.managerId.code) { // Pour trier sur les initiales du responsable
      name = this.namesMap.managerLabel.code;
    }

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
