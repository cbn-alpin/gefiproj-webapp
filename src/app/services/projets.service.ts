import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Projet } from 'src/app/models/projet';

/**
 * Effectue les appels au serveur d'API pour les projets.
 */
@Injectable({
  providedIn: 'root'
})
export class ProjetsService {

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
      return await (this.http.get<Projet[]>('/api/projets').toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
