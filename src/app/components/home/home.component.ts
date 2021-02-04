import { Recette } from './../../models/recette';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { Financement, Statut_F } from 'src/app/models/financement';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UsersService } from 'src/app/services/users.service';
import {
  GenericDialogComponent,
  IMessage,
} from 'src/app/shared/components/generic-dialog/generic-dialog.component';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { EntitySelectBoxOptions } from 'src/app/shared/components/generic-table/models/entity-select-box-options';
import { GenericTableFormError } from 'src/app/shared/components/generic-table/models/generic-table-entity';
import { SelectBoxOption } from 'src/app/shared/components/generic-table/models/SelectBoxOption';
import { SortInfo } from 'src/app/shared/components/generic-table/models/sortInfo';
import { ProjetsService } from '../../services/projets.service';
import { Projet } from './../../models/projet';
import { Utilisateur } from './../../models/utilisateur';
import { CrudService } from './../../services/crud.service';
import { GenericTableEntityEvent } from './../../shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from './../../shared/components/generic-table/models/generic-table-options';
import { MontantAffecte } from 'src/app/models/montantAffecte';
import { PopupService } from '../../shared/services/popup.service';
import { FinancementsService } from 'src/app/services/financements.service';
import { FinanceurService } from 'src/app/services/financeur.service';

/**
 * Affiche les projets.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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
    return (this.projets || []).filter((p) => !p.statut_p);
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
    status: { code: 'statut_p', name: 'Est soldé' },
  };

  /**
   * Représente un nouveau projet et définit les colonnes à afficher.
   */
  private readonly defaultEntity = {
    code_p: 20000,
    nom_p: '',
    id_u: 0,
    statut_p: false,
  } as Projet;

  /**
   * Paramètres du tableau de projets.
   */
  options: GenericTableOptions<Projet> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      {
        code: this.namesMap.code.code,
        type: GenericTableCellType.NUMBER,
        name: this.namesMap.code.name,
        sortEnabled: true,
      },
      {
        code: this.namesMap.name.code,
        type: GenericTableCellType.TEXT,
        name: this.namesMap.name.name,
        sortEnabled: true,
      },
      {
        code: this.namesMap.managerId.code,
        type: GenericTableCellType.SELECTBOX,
        name: this.namesMap.manager.name,
        sortEnabled: true,
      },
      {
        code: this.namesMap.status.code,
        type: GenericTableCellType.BOOLEAN,
        name: this.namesMap.status.name,
        sortEnabled: true,
      },
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: [],
    sortName: this.namesMap.code.name,
    sortDirection: 'asc',
    navigationUrlFt: (project) => `projet/${project?.id_p || 0}`,
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
   * Affiche les projets.
   * @param adminSrv : permet de vérifier si l'utilisateur est un administrateur.
   * @param projectsSrv : permet de dialoguer avec le serveur d'API pour les entités Projet.
   * @param usersSrv : permet de charger les utilisateurs.
   * @param popupService : affiche une information.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private adminSrv: IsAdministratorGuardService,
    private dialog: MatDialog,
    private popupService: PopupService,
    private projectsSrv: ProjetsService,
    private usersSrv: UsersService,
    private spinnerSrv: SpinnerService,

    // Pour entrer les données de tests
    private httpSrv: HttpClient,
    private fSrv: FinancementsService,
    private feursSrv: FinanceurService
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
      values:
        this.managers?.map<SelectBoxOption<Utilisateur>>((u) =>
          this.transformToSbOption(u)
        ) || [],
    };
    const entitySelectBoxOptions = [userSelectBoxOption];

    const options = Object.assign({}, this.options, {
      dataSource,
      entitySelectBoxOptions,
    });
    options.defaultEntity.code_p =
      (new Date(Date.now()).getFullYear() % 100) * 1000;
    this.options = options;
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
      item: user || null,
    };
  }

  /**
   * Charge les responsables depuis le serveur.
   */
  async loadManagers(): Promise<Utilisateur[]> {
    try {
      this.spinnerSrv.show();
      this.managers = (await this.usersSrv.getAll()) // RG : tous les utilisateurs actifs peuvent être responsable projets
        .filter((m) => m.active_u)
        .sort((m1, m2) => this.compareManagers(m1, m2));
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de charger les responsables de projet.'
      );
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Compare les utilisateurs en paramètres, via leurs initiales.
   * @param user1 : un utilisateur.
   * @param user2 : un utilisateur.
   */
  private compareManagers(user1: Utilisateur, user2: Utilisateur): number {
    if (user1.initiales_u < user2.initiales_u) {
      return -1;
    } else if (user1.initiales_u > user2.initiales_u) {
      return 1;
    } else {
      return 0;
    }
  }

  /**
   * Charge les projets depuis le serveur.
   */
  async loadProjects(): Promise<void> {
    try {
      this.spinnerSrv.show();
      this.projets = (await this.projectsSrv.getAll()) || [];
      this.projets.forEach((p) => this.injectManager(p));
    } catch (error) {
      console.error(error);
      this.popupService.error('Impossible de charger les projets.');
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Met à jour les données d'affichage.
   */
  private refreshDataTable(): void {
    try {
      const dataSource = this.sort(this.visibleProjects);

      this.options = Object.assign({}, this.options, {
        dataSource,
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
        throw new Error("Le projet n'existe pas");
      }

      this.injectManager(project);

      if (this.validateForGenericTable(event)) {
        await this.projectsSrv.modify(project);
        this.injectManager(project); // Obligatoire car le service nettoye l'entité
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.updateProject(project);
        this.refreshDataTable(); // Pour le trie et pour cacher le projet le cas échéant
        this.popupService.success(
          `Le projet \'${project.nom_p} (${project.code_p})\' a été modifié.`
        );
      }
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de modifier le projet.',
      });
    }
  }

  /**
   * Met à jour un projet dans le repo interne.
   * @param project : version modifiée.
   */
  private updateProject(project: Projet): void {
    const index = this.projets.findIndex((p) => p.id_p === project.id_p);

    if (index >= 0) {
      this.projets[index] = project;
    }
  }

  /**
   * Vérifie la validité du projet en paramètre. Si le projet est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule un nouveau projet ou un projet modifié.
   */
  private validateForGenericTable(
    gtEvent: GenericTableEntityEvent<Projet>
  ): boolean {
    if (!gtEvent) {
      throw new Error("Le paramètre 'gtEvent' est invalide");
    }

    try {
      const project = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      this.verifProjectCode(project, formErrors);
      this.verifProjectName(project, formErrors);
      this.verifProjectManager(project, formErrors);

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
   * Vérifie la validité du responsable sur le projet.
   * @param project : projet à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifProjectManager(
    project: Projet,
    formErrors: GenericTableFormError[]
  ): void {
    if (!project.responsable) {
      const error = {
        name: this.namesMap.managerId.code,
        message: 'Un responsable projet doit être défini.',
      };

      formErrors.push(error);
    }
  }

  /**
   * Vérifie la validité du nom sur le projet.
   * @param project : projet à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifProjectName(
    project: Projet,
    formErrors: GenericTableFormError[]
  ): void {
    if (!project.nom_p) {
      const error = {
        name: this.namesMap.name.code,
        message: 'Le nom du projet doit être indiqué.',
      };

      formErrors.push(error);
    }

    if (project.nom_p.length < 3) {
      const error = {
        name: this.namesMap.name.code,
        message: 'Le nom du projet doit avoir au moins 3 caractères.',
      };

      formErrors.push(error);
    }

    const similarProject = this.projets.find(
      (p) =>
        p.id_p !== project.id_p &&
        p.nom_p.toUpperCase() === project.nom_p.toUpperCase()
    );

    if (similarProject) {
      const error = {
        name: this.namesMap.name.code,
        message: 'Le nom du projet doit être unique.',
      };

      formErrors.push(error);
    }
  }

  /**
   * Vérifie la validité du code sur le projet.
   * @param project : projet à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifProjectCode(
    project: Projet,
    formErrors: GenericTableFormError[]
  ): void {
    if (typeof project.code_p === 'string') {
      // Le tableau retourne une string !
      project.code_p = parseInt(project.code_p as string, 10);
    }

    if (isNaN(project.code_p)) {
      const error = {
        name: this.namesMap.code.code,
        message: 'Le code projet doit ne comprendre que des chiffres.',
      };

      formErrors.push(error);
    }

    if (('' + project.code_p).length !== 5) {
      const error = {
        name: this.namesMap.code.code,
        message: 'Le code projet doit comprendre 5 chiffres.',
      };

      formErrors.push(error);
    }

    const codeVal = project.code_p || 0;
    const date = new Date(Date.now());
    const year = date.getFullYear() % 100;
    const min = Math.max(20, year - 10); // Démarrage en 2020
    const max = year + 10;
    if (codeVal / 1000 < min || Math.floor(codeVal / 1000) > max) {
      const error = {
        name: this.namesMap.code.code,
        message: `Le code projet doit être une valeur comprise entre ${min}000 et ${max}999.`,
      };

      formErrors.push(error);
    }

    const similarProject = this.projets.find(
      (p) => p.id_p !== project.id_p && p.code_p === project.code_p
    );

    if (similarProject) {
      const error = {
        name: this.namesMap.code.code,
        message: 'Le code du projet doit être unique.',
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
        throw new Error("Le projet n'existe pas");
      }

      this.injectManager(project);

      if (this.validateForGenericTable(event)) {
        project = await this.projectsSrv.add(event.entity);
        this.injectManager(project); // Obligatoire car le service nettoye l'entité
        event.callBack(null); // Valide la modification dans le composant DataTable fils

        this.addProject(project);
        this.refreshDataTable(); // Pour le trie et pour cacher le projet le cas échéant
        this.popupService.success(
          `Le projet \'${project.nom_p} (${project.code_p})\' a été créé.`
        );
      }
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de créer le projet.',
      });
    }
  }

  /**
   * Détermine le responsable à partir de son identifiant et injecte ses initiales dans le projet ; pour faciliter le trie.
   * @param project : projet concerné.
   */
  private injectManager(project: Projet): void {
    try {
      if (!project.id_u) {
        project.id_u = project.responsable?.id_u || 0;
      }

      if (
        (!project.responsable || project.responsable.id_u !== project.id_u) &&
        project.id_u > 0
      ) {
        project.responsable =
          this.managers.find((m) => m.id_u === project.id_u) || null;
      }

      project[this.namesMap.managerLabel.code] =
        project.responsable?.initiales_u || ''; // Initiales, pour le trie
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
        throw new Error("Le projet n'existe pas");
      }

      // Vérification des RG
      const fundings = (await this.projectsSrv.getFundings(project)) || [];
      const isEmpty = fundings.length === 0;

      if (!isEmpty) {
        // RG : Ne pas supprimer un projet avec des financements
        event?.callBack({
          apiError:
            'Impossible de supprimer le projet car il possède des financements.',
        });
        return;
      }

      // Etes-vous sûr ?
      const data: IMessage = {
        header: 'Suppression du projet',
        content: `Vous vous apprêtez à supprimer le projet \'${project.nom_p} (${project.code_p})\'. Etes-vous certain de vouloir le supprimer ?`,
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
        await this.projectsSrv.delete(project);
        event.callBack(null); // Valide la modification dans le composant DataTable fils
        this.deleteProject(project);
        this.popupService.success(
          `Le projet \'${project.nom_p} (${project.code_p})\' a été supprimé.`
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
        apiError: 'Impossible de supprimer le projet.',
      });
    }
  }

  /**
   * Supprime un projet dans le repo interne.
   * @param project : projet à supprimer.
   */
  private deleteProject(project: Projet): void {
    const index = this.projets.findIndex((p) => p.id_p === project.id_p);

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
      direction: 'asc',
    };
    const mult =
      direction === 'asc' // Pour gérer le sens du trie
        ? 1
        : -1;

    if (name === this.namesMap.managerId.code) {
      // Pour trier sur les initiales du responsable
      name = this.namesMap.managerLabel.code;
    }

    return projects.sort((p1, p2) => {
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

  private async deleteData(): Promise<void> {
    for (const projet of this.projets) {
      if (projet.code_p >= 23000) {
        continue; // Projets de travail, hors projets de tests métier
      }

      const fSrvByP = new CrudService<Financement>(
        this.httpSrv,
        this.spinnerSrv,
        `/api/projects/${projet.id_p}/fundings`
      );

      const financements = await fSrvByP.getAll();

      for (const financement of financements) {
        const rSrvByF = new CrudService<Recette>(
          this.httpSrv,
          this.spinnerSrv,
          `/api/fundings/${financement.id_f}/receipts`
        );

        const recettes = await rSrvByF.getAll();

        for (const recette of recettes) {
          const maSrvByR = new CrudService<MontantAffecte>(
            this.httpSrv,
            this.spinnerSrv,
            `/api/receipts/${recette.id_r}/amounts`
          );

          const affectations = await maSrvByR.getAll();

          for (const affectation of affectations) {
            const maSrv = new CrudService<MontantAffecte>(
              this.httpSrv,
              this.spinnerSrv,
              `/api/amounts`
            );

            await maSrv.delete(affectation.id_ma);
          }

          const rSrv = new CrudService<Recette>(
            this.httpSrv,
            this.spinnerSrv,
            `/api/receipts`
          );
          await rSrv.delete(recette.id_r);
        }

        const fSrv = new CrudService<Financement>(
          this.httpSrv,
          this.spinnerSrv,
          `/api/fundings`
        );
        await fSrv.delete(financement.id_f);
      }

      await this.projectsSrv.delete(projet);
    }
  }

  public async onChargeTestsData(): Promise<void> {
    try {
      await this.deleteData();

      // date_arrete_f: new Date(2017, 5, 2), date_limite_solde_f: new Date(2020, 9, 24)
      const projets: Projet[] = this.getProjetsForTests();
      const user = (await this.usersSrv.getAll())
        .filter(u => u.email_u === 'b.lienard@cbn-alpin.fr')[0];
      const financeur = (await this.feursSrv.getAll())[0];

      for (let projet of projets) {
        const financements: Financement[] = (projet as any).financements || [];
        projet.id_u = user.id_u;
        delete projet.id_p;
        delete (projet as any).financements;

        projet = await this.projectsSrv.add(projet);

        for (let financement of financements) {
          const recettes: Recette[] = (financement as any).recettes || [];
          financement.id_p = projet.id_p;
          financement.commentaire_admin_f = 'Données de tests !';
          financement.id_financeur = financeur.id_financeur;
          delete financement.id_f;
          delete (financement as any).recettes;
          const fSrv = new CrudService<Financement>(
            this.httpSrv,
            this.spinnerSrv,
            `/api/fundings`
          );

          financement = await this.fSrv.post(financement);
          const rSrv = new CrudService<Recette>(
            this.httpSrv,
            this.spinnerSrv,
            `/api/receipts`
          );

          for (let recette of recettes) {
            const affectations: MontantAffecte[] = (recette as any).affectations || [];
            recette.id_f = financement.id_f;
            delete recette.id_r;
            delete (recette as any).affectations;
            const maSrv = new CrudService<MontantAffecte>(
              this.httpSrv,
              this.spinnerSrv,
              `/api/amounts`
            );

            recette = await rSrv.add(recette);
            for (let affectation of affectations) {
              affectation.id_r = recette.id_r;
              delete affectation.id_ma;

              affectation = await maSrv.add(affectation);
            }
          }
        }
      }

      this.ngOnInit();
    } catch (error) {
      console.error(error);
    }
  }

  private getProjetsForTests(): Projet[] {
    return [
      {
        code_p: 16025, nom_p: 'Alcotra Resthalp', id_u: 36, statut_p: false, id_p: 0,
        financements: [
          {
            date_arrete_f: '2017-5-2', date_limite_solde_f: '2020-9-24', montant_arrete_f: 65329.95, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 7008.33, annee_r: 2017, affectations: [
                  { montant_ma: 1572, annee_ma: 2016 } as MontantAffecte,
                  { montant_ma: 5436.33, annee_ma: 2017 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 32104.95, annee_r: 2019, affectations: [
                  { montant_ma: 19604.67, annee_ma: 2017 } as MontantAffecte,
                  { montant_ma: 12500.28, annee_ma: 2018 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 26216.67, annee_r: 2020, affectations: [
                  { montant_ma: 483.72, annee_ma: 2018 } as MontantAffecte,
                  { montant_ma: 10628, annee_ma: 2019 } as MontantAffecte,
                  { montant_ma: 15104.95, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement
        ]
      } as Projet,
      {
        code_p: 18003, nom_p: 'SCALP', id_u: 36, statut_p: false, id_p: 0,
        financements: [
          {
            date_arrete_f: '2019-4-29', date_limite_solde_f: '2020-3-31', montant_arrete_f: 16506, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 4951.8, annee_r: 2019, affectations: [
                  { montant_ma: 4951.8, annee_ma: 2019 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 11554.2, annee_r: 2020, affectations: [
                  { montant_ma: 11554.2, annee_ma: 2019 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            date_arrete_f: '2019-4-2', date_limite_solde_f: '2022-9-30', montant_arrete_f: 101001.5, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 29390.77, annee_r: 2020, affectations: [
                  { montant_ma: 29390.77, annee_ma: 2019 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 38646.5, annee_r: 2021, affectations: [
                  { montant_ma: 38646.5, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 32964.23, annee_r: 2022, affectations: [
                  { montant_ma: 32964.23, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            date_arrete_f: '2020-5-25', date_limite_solde_f: '2021-3-30', montant_arrete_f: 23187, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 11593.5, annee_r: 2020, affectations: [
                  { montant_ma: 11593.5, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 11593.5, annee_r: 2021, affectations: [
                  { montant_ma: 11593.5, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            montant_arrete_f: 20907, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 6272.1, annee_r: 2021, affectations: [
                  { montant_ma: 6272.1, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 14634.9, annee_r: 2022, affectations: [
                  { montant_ma: 14634.9, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement
        ]
      } as Projet,
      {
        code_p: 18004, nom_p: 'ROCVEG', id_u: 36, statut_p: false, id_p: 0,
        financements: [
          {
            date_arrete_f: '2019-3-19', date_limite_solde_f: '2020-3-31', montant_arrete_f: 11436.37, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 5232.51, annee_r: 2019, affectations: [
                  { montant_ma: 5232.51, annee_ma: 2019 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 6203.86, annee_r: 2020, affectations: [
                  { montant_ma: 6203.86, annee_ma: 2019 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            date_arrete_f: '2019-6-18', date_limite_solde_f: '2022-6-30', montant_arrete_f: 58631.11, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 19060.61, annee_r: 2020, affectations: [
                  { montant_ma: 19060.61, annee_ma: 2019 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 17641.5, annee_r: 2021, affectations: [
                  { montant_ma: 17641.5, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 21929, annee_r: 2022, affectations: [
                  { montant_ma: 21929, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            date_arrete_f: '2020-5-25', date_limite_solde_f: '2021-3-30', montant_arrete_f: 10139, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 5069.5, annee_r: 2020, affectations: [
                  { montant_ma: 5069.5, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 5069.5, annee_r: 2021, affectations: [
                  { montant_ma: 5069.5, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            montant_arrete_f: 12372.9, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 3711.87, annee_r: 2021, affectations: [
                  { montant_ma: 3711.87, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 8661.02, annee_r: 2022, affectations: [
                  { montant_ma: 8661.02, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement
        ]
      } as Projet,
      {
        code_p: 18022, nom_p: 'SILENE', id_u: 36, statut_p: false, id_p: 0,
        financements: [
          {
            date_arrete_f: '2018-2-14', date_limite_solde_f: '2019-2-13', montant_arrete_f: 7000, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 7000, annee_r: 2018, affectations: [
                  { montant_ma: 7000, annee_ma: 2018 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement
        ]
      } as Projet,
      {
        code_p: 18059, nom_p: 'Infloreb', id_u: 36, statut_p: false, id_p: 0,
        financements: [
          {
            date_arrete_f: '2019-3-11', date_limite_solde_f: '2022-12-31', montant_arrete_f: 40000, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 12000, annee_r: 2019, affectations: [
                  { montant_ma: 12000, annee_ma: 2019 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 28000, annee_r: 2020, affectations: [
                  { montant_ma: 28000, annee_ma: 2019 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            date_arrete_f: '2019-11-18', date_limite_solde_f: '2022-12-31', montant_arrete_f: 40000, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 12000, annee_r: 2019, affectations: [
                  { montant_ma: 12000, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 28000, annee_r: 2021, affectations: [
                  { montant_ma: 28000, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            date_arrete_f: '2019-11-14', date_limite_solde_f: '2022-12-31', montant_arrete_f: 40000, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 12000, annee_r: 2019, affectations: [
                  { montant_ma: 12000, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 28000, annee_r: 2022, affectations: [
                  { montant_ma: 28000, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            date_arrete_f: '2019-8-8', date_limite_solde_f: '2022-6-30', montant_arrete_f: 120000, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 40000, annee_r: 2020, affectations: [
                  { montant_ma: 40000, annee_ma: 2019 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 40000, annee_r: 2021, affectations: [
                  { montant_ma: 40000, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 40000, annee_r: 2022, affectations: [
                  { montant_ma: 40000, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement
        ]
      } as Projet,
      {
        code_p: 19017, nom_p: 'Floreclim', id_u: 36, statut_p: false, id_p: 0,
        financements: [
          {
            date_arrete_f: '2020-1-28', date_limite_solde_f: '2022-4-15', montant_arrete_f: 22170, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 11085, annee_r: 2020, affectations: [
                  { montant_ma: 10258, annee_ma: 2020 } as MontantAffecte,
                  { montant_ma: 827, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 11085, annee_r: 2022, affectations: [
                  { montant_ma: 9653, annee_ma: 2021 } as MontantAffecte,
                  { montant_ma: 1432, annee_ma: 2022 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            date_arrete_f: '2020-4-27', date_limite_solde_f: '2022-8-14', montant_arrete_f: 17149, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 3429.8, annee_r: 2020, affectations: [
                  { montant_ma: 3429.8, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 13719.2, annee_r: 2021, affectations: [
                  { montant_ma: 12440.2, annee_ma: 2020 } as MontantAffecte,
                  { montant_ma: 1279, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            montant_arrete_f: 17149, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 3429.8, annee_r: 2021, affectations: [
                  { montant_ma: 3429.8, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 13719.2, annee_r: 2022, affectations: [
                  { montant_ma: 11504, annee_ma: 2021 } as MontantAffecte,
                  { montant_ma: 2215.2, annee_ma: 2022 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement,
          {
            date_arrete_f: '2020-2-24', date_limite_solde_f: '2022-10-31', montant_arrete_f: 95270, statut_f: Statut_F.ATR, id_financeur: 2, id_p: 0,
            recettes: [
              {
                montant_r: 44086, annee_r: 2021, affectations: [
                  { montant_ma: 44086, annee_ma: 2020 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 45036, annee_r: 2022, affectations: [
                  { montant_ma: 45036, annee_ma: 2021 } as MontantAffecte
                ]
              } as Recette,
              {
                montant_r: 6148, annee_r: 2023, affectations: [
                  { montant_ma: 6148, annee_ma: 2022 } as MontantAffecte
                ]
              } as Recette
            ]
          } as Financement
        ]
      } as Projet
    ];
  }
}
