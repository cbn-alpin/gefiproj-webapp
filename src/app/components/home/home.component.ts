import { Utilisateur } from './../../models/utilisateur';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UsersService } from 'src/app/services/users.service';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableFormError } from 'src/app/shared/components/generic-table/models/generic-table-entity';
import { ProjetsService } from '../../services/projets.service';
import { Projet } from './../../models/projet';
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
   * Liste des projets.
   */
  projets: Projet[] = [];

  /**
   * Responsables des projets.
   */
  managers: Utilisateur[];

  /**
   * Mapping pour les noms des attributs d'un projet.
   */
  private readonly namesMap = {
    id: 'id_p',
    code: 'code_p',
    name: 'nom_p',
    manager: 'responsable',
    status: 'statut_p'
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
      { code: this.namesMap.code, type: GenericTableCellType.NUMBER, name: 'Code'},
      { code: this.namesMap.name, type: GenericTableCellType.TEXT, name: 'Nom' },
      { code: this.namesMap.manager, type: GenericTableCellType.SELECTBOX, name: 'Responsable' },
      { code: this.namesMap.status, type: GenericTableCellType.BOOLEAN, name: 'Statut' }
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: []
  };

  /**
   * Affiche les projets.
   * @param projectsSrv : permet de dialoguer avec le serveur d'API pour les entités Projet.
   * @param usersSrv : permet de charger les utilisateurs.
   * @param snackBar : affiche une information.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
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

      this.options = Object.assign({}, this.options, {
        dataSource: this.projets,
        entitySelectBoxOptions: [
          {
            name: this.namesMap.manager,
            values: this.managers?.map(u => u.initiales_u) || []
          }
        ]
      });
    } catch (error) {
      console.error(error);
    }
  }

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
        event.callBack(null);
      }
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de modifier le projet.'
      });
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
          name: this.namesMap.code,
          message: 'Le code projet doit être une valeur comprise entre 1 et 9999.'
        };
        formErrors.push(error);
      }

      if (!project.nom_p) {
        const error = {
          name: this.namesMap.name,
          message: 'Le nom du projet doit être indiqué.'
        };
        formErrors.push(error);
      }

      if (!project.responsable) {
        const error = {
          name: this.namesMap.manager,
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
      const project = event?.entity;
      if (!project) {
        throw new Error('Le projet n\'existe pas');
      }

      if (this.validateForGenericTable(event)) {
        await this.projectsSrv.add(event.entity);
        event.callBack(null);
      }
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de créer le projet.'
      });
    }
  }

  /**
   * Un projet a été supprimé du tableau.
   * @param event : encapsule le projet à modifier.
   */
  async onDelete(event: GenericTableEntityEvent<Projet>): Promise<void> {
    try {
      await this.projectsSrv.delete(event.entity);
      event.callBack(null);
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de supprimer le projet.'
      });
    }
  }
}
