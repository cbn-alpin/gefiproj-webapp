import { Projet } from './../../models/projet';
import { Component, OnInit } from '@angular/core';
import { ProjetsService } from './projets.service';

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
   * Affiche les projets.
   * @param projetsSrv : permet de dialoguer avec le serveur d'API pour les entités Projet.
   */
  constructor(
    private projetsSrv: ProjetsService) { }

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
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
