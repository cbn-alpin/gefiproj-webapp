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
  private readonly endPoint = '/api/projets';

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
    return this.crudSrv.getAll();
  }

  /**
   * Retourne le projet demandé depuis le serveur.
   * @param id : identifiant du projet demandé.
   */
  public async get(id: number): Promise<Projet> {
    return this.crudSrv.get(id);
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
      const newProject = await this.crudSrv.add(project);

      // Récupération de l'identifiant
      (newProject || {id_p: 0}).id_p = project.id_p = newProject?.id_p
        || (newProject as any)?.id // gestion de json-server
        || project?.id_p
        || (project as any)?.id // gestion de json-server
        || 0;
      return newProject || project;
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
