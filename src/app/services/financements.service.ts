import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Financement } from '../models/financement';
import { Projet } from '../models/projet';
import { CrudService } from './crud.service';
import { ProjetsService } from './projets.service';
import { SpinnerService } from './spinner.service';

@Injectable({
  providedIn: 'root'
})
export class FinancementsService {
  /**
   * Url relative de l'API.
   */
  public readonly endPoint = '/api/fundings';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Financement>;

  /**
   * Effectue les appels au serveur d'API pour les financements.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    http: HttpClient,
    spinnerSrv: SpinnerService,
    private projectSrv: ProjetsService) {
      this.crudSrv = new CrudService<Financement>(
        http,
        spinnerSrv,
        this.endPoint);
  }

  /**
   * Retourne les financements depuis le un projet en paramètre.
   * @param projetId : l'id du projet.
   */
  public async getAll(projetId: number): Promise<Financement[]> {
    try {
      if (isNaN(projetId)) {
        throw new Error('Pas d\'identifiant valide.');
      }

      const project = {} as Projet;
      project.id_p = projetId;

      return this.projectSrv.getFundings(project);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Transmet le financement d'un projet modifié au serveur.
   * @param financement : le financement modifié
   */
  public async put(financement: Financement): Promise<Financement> {
    return this.crudSrv.modify(
      financement,
      financement?.id_f);
  }

  /**
   * Transmet le financement d'un projet au serveur.
   * @param financement : le financement à créer
   */
  public async post(financement: Financement): Promise<Financement> {
    try {
      return this.crudSrv.add(financement, 'id_f');
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Demande la suppression d'un financement
   * @param financement : le financement à supprimer
   */
  public async delete(financement: Financement): Promise<void> {
    return this.crudSrv.delete(financement.id_f);
  }
}
