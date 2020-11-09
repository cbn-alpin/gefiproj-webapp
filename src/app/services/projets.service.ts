import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Projet } from 'src/app/models/projet';
import { AuthService } from './authentication/auth.service';

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
   * Effectue les appels au serveur d'API pour les projets.
   * @param http : permet d'effectuer les appels au serveur d'API.
   */
  constructor(
    private http: HttpClient) { }

  /**
   * Retourne les projets depuis le serveur.
   */
  public async get(): Promise<Projet[]> {
    try {
      return await (this.http
        .get<Projet[]>(this.endPoint)
        .toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Transmet le projet modifié au serveur.
   * @param projet : projet modifié.
   */
  public async modify(projet: Projet): Promise<Projet> {
    try {
      if (isNaN(projet?.id)) {
        throw new Error('Pas d\'indentifiant.');
      }

      const url = `${this.endPoint}/${projet.id}`;
      return await (this.http.put<Projet>(
        url,
        JSON.stringify(projet), {
        headers: new HttpHeaders(AuthService.headers)
      })
        .toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Transmet le nouveau projet au serveur.
   * @param projet : projet à créer.
   */
  public async add(projet: Projet): Promise<Projet> {
    try {
      const newProject = await (this.http.post<Projet>(
        this.endPoint,
        JSON.stringify(projet), {
        headers: new HttpHeaders(AuthService.headers)
      })
        .toPromise());

      // Récupération de l'identifiant
      projet.id = newProject.id || 0;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Demande la suppression du projet au serveur.
   * @param projet : projet à supprimer.
   */
  public async delete(projet: Projet): Promise<Projet> {
    try {
      if (isNaN(projet?.id)) {
        throw new Error('Pas d\'indentifiant.');
      }

      const url = `${this.endPoint}/${projet.id}`;
      const newProject = await (this.http
        .delete<Projet>(url)
        .toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
