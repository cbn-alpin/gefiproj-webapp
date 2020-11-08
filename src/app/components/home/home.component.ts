import { GenericTableOptions } from './../../shared/components/generic-table/models/generic-table-options';
import { Projet } from './../../models/projet';
import { Component, OnInit } from '@angular/core';
import { ProjetsService } from '../../services/projets.service';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';

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
  options: GenericTableOptions<Projet> = {
    dataSource: [],
    defaultEntity: {
      id: -1,
      code: -1,
      nom: '<nouveau projet>',
      responsable: '',
      statut: false
    },
    entityTypes: [
      { name: 'id', type: GenericTableCellType.NUMBER },
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

  onEdit(a) {

  }

  onCreate(a) {

  }

  onDelete(a) {

  }
}
