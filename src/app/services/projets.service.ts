import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Projet } from 'src/app/models/projet';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

/**
 * Effectue les appels au serveur d'API pour les projets.
 */
@Injectable({
  providedIn: 'root'
})
export class ProjetsService {
  /**
   * Url relative de l'API.
   */
  private readonly endPoint = '/api/projects';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Projet>;

  /**
   * Effectue les appels au serveur d'API pour les projets.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    http: HttpClient,
    spinnerSrv: SpinnerService) {
      this.crudSrv = new CrudService<Projet>(
        http,
        spinnerSrv,
        this.endPoint);
    }

  /**
   * Retourne les projets depuis le serveur.
   */
  public async getAll(): Promise<Projet[]> {
    return this.crudSrv.getAll(0, 'id_p');
  }

  /**
   * Retourne le projet demandé depuis le serveur.
   * @param id : identifiant du projet demandé.
   */
  public async get(id: number): Promise<Projet> {
    return this.crudSrv.get(id, 'id_p');
  }

  /**
   * Transmet le projet modifié au serveur.
   * @param project : projet modifié.
   */
  public async modify(project: Projet): Promise<Projet> {
    return this.crudSrv.modify(
      project,
      project?.id_p);
  }

  /**
   * Transmet le nouveau projet au serveur.
   * @param project : projet à créer.
   */
  public async add(project: Projet): Promise<Projet> {
    try {
      return await this.crudSrv
        .add(project, 'id_p');
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Demande la suppression du projet au serveur.
   * @param project : projet à supprimer.
   */
  public async delete(project: Projet): Promise<void> {
    const id = project?.id_p || (project as any)?.id; // Pour json-server
    return this.crudSrv.delete(id);
  }
}
