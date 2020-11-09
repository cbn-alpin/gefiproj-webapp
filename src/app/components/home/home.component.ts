import { Component, OnInit } from '@angular/core';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
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
   * Liste des projets.
   */
  projets: Projet[] = [];

  /**
   * Titre du tableau générique
   */
  readonly title = 'Projets';

  /**
   * Représente un nouveau projet et définit les colonnes à afficher.
   */
  private readonly defaultEntity = {
    code: 0,
    nom: '',
    responsable: '',
    statut: false
  } as Projet;

  /**
   * Paramètres du tableau de projets.
   */
  options: GenericTableOptions<Projet> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      { name: 'code', type: GenericTableCellType.NUMBER },
      { name: 'nom', type: GenericTableCellType.TEXT },
      { name: 'responsable', type: GenericTableCellType.TEXT },
      { name: 'statut', type: GenericTableCellType.BOOLEAN }
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: []
  };

  /**
   * Affiche les projets.
   * @param projetsSrv : permet de dialoguer avec le serveur d'API pour les entités Projet.
   */
  constructor(
    private projetsSrv: ProjetsService) {

  }

  /**
   * Initialise le composant.
   */
  async ngOnInit(): Promise<void> {
    try {
      await this.loadProjects();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Charge les projets depuis le serveur.
   */
  async loadProjects(): Promise<void> {
    try {
      this.projets = await this.projetsSrv.get();
      this.options = Object.assign({}, this.options, {
        dataSource: this.projets
      });
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Un projet a été modifié dans le tableau.
   * @param event : encapsule le projet à modifier.
   */
  async onEdit(event: GenericTableEntityEvent<Projet>): Promise<void> {
    try {
      await this.projetsSrv.modify(event.entity);
      event.callBack(null);
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de modifier le projet.'
      });
    }
  }

  /**
   * Un projet a été créé et initialisé dans le tableau.
   * @param event : encapsule le projet à modifier.
   */
  async onCreate(event: GenericTableEntityEvent<Projet>): Promise<void> {
    try {
      await this.projetsSrv.add(event.entity);
      event.callBack(null);
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
      await this.projetsSrv.delete(event.entity);
      event.callBack(null);
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de supprimer le projet.'
      });
    }
  }
}