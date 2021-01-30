import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Financement } from 'src/app/models/financement';
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
    private http: HttpClient,
    private spinnerSrv: SpinnerService) {
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
    try {
      this.cleanProject(project);

      return this.crudSrv.modify(
        project,
        project?.id_p);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Transmet le nouveau projet au serveur.
   * @param project : projet à créer.
   */
  public async add(project: Projet): Promise<Projet> {
    try {
      this.cleanProject(project);

      return await this.crudSrv
        .add(project);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Supprime les propriétés non attendues par le serveur.
   * @param project : projet à nettoyer.
   */
  private cleanProject(project: Projet): void {
    try {
      delete project.responsable;
      delete (project as any).initiales_u;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Demande la suppression du projet au serveur.
   * @param project : projet à supprimer.
   */
  public async delete(project: Projet): Promise<void> {
    const id = project?.id_p || 0;
    return this.crudSrv.delete(id);
  }

  /**
   * Retourne les financements du projet indiqué.
   * @param project : projet ciblé.
   */
  public async getFundings(project: Projet): Promise<Financement[]> {
    try {
      const id = project.id_p;
      const fundingsSrv = new CrudService<Financement>(
        this.http,
        this.spinnerSrv,
        `${this.endPoint}/${id}/fundings`);

      return fundingsSrv.getAll();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
