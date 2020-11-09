import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Projet } from 'src/app/models/projet';
import { AuthService } from './authentication/auth.service';
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
   * Effectue les appels au serveur d'API pour les projets.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private http: HttpClient,
    private spinnerSrv: SpinnerService) { }

  /**
   * Retourne les projets depuis le serveur.
   */
  public async getAll(): Promise<Projet[]> {
    try {
      this.spinnerSrv.show();
      return await (this.http
        .get<Projet[]>(this.endPoint)
        .toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Transmet le projet modifié au serveur.
   * @param projet : projet modifié.
   */
  public async modify(projet: Projet): Promise<Projet> {
    try {
      this.spinnerSrv.show();

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
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Transmet le nouveau projet au serveur.
   * @param projet : projet à créer.
   */
  public async add(projet: Projet): Promise<Projet> {
    try {
      this.spinnerSrv.show();
      const newProject = await (this.http.post<Projet>(
        this.endPoint,
        JSON.stringify(projet), {
        headers: new HttpHeaders(AuthService.headers)
      })
        .toPromise());

      // Récupération de l'identifiant
      projet.id = newProject.id || 0;

      return newProject || projet;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Demande la suppression du projet au serveur.
   * @param projet : projet à supprimer.
   */
  public async delete(projet: Projet): Promise<void> {
    try {
      this.spinnerSrv.show();
      if (isNaN(projet?.id)) {
        throw new Error('Pas d\'indentifiant.');
      }

      const url = `${this.endPoint}/${projet.id}`;
      await (this.http
        .delete<Projet>(url)
        .toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }
}
