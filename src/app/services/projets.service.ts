import { Financement } from 'src/app/models/financement';
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
    return this.crudSrv.getAll('id_p');
  }

  /**
   * Retourne le projet2 demandé depuis le serveur.
   * @param id : identifiant du projet2 demandé.
   */
  public async get(id: number): Promise<Projet> {
    return this.crudSrv.get(id, 'id_p');
  }

  /**
   * Transmet le projet2 modifié au serveur.
   * @param project : projet2 modifié.
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
   * Transmet le nouveau projet2 au serveur.
   * @param project : projet2 à créer.
   */
  public async add(project: Projet): Promise<Projet> {
    try {
      this.cleanProject(project);

      return await this.crudSrv
        .add(project, 'id_p');
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
   * Demande la suppression du projet2 au serveur.
   * @param project : projet2 à supprimer.
   */
  public async delete(project: Projet): Promise<void> {
    const id = project?.id_p || (project as any)?.id; // Pour json-server
    return this.crudSrv.delete(id);
  }

  /**
   * Retourne les financements2 du projet2 indiqué.
   * @param project : projet2 ciblé.
   */
  public async getFundings(project: Projet): Promise<Financement[]> {
    try {
      const id = project.id_p;
      const fundingsSrv = new CrudService<Financement>(
        this.http,
        this.spinnerSrv,
        `http://127.0.0.1:5000/api/projects/${id}/fundings`); // `${this.endPoint}/${id}/fundings`);

      return fundingsSrv.getAll('id_f');
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
