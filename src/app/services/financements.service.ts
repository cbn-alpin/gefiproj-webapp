import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Financement } from '../models/financement';


/**
 * URL de base des requêtes.
 */
const BASE_URL = 'http://127.0.0.1:5000/financements';


@Injectable({
  providedIn: 'root'
})
export class FinancementsService {
  /**
   * URL pour ouvrir une session via un Token.
   */
  public static readonly Financement_URL = `${BASE_URL}`;

  
  /**
   * Gère les financements
   * @param http : permet de lancer des requêtes.
   * 
   */
  constructor(private http: HttpClient) {
  }

  /**
   * Get les financements d'un projet
   * @param projetId : l'id du projet
   */
  public async get_by_id(projetId: string): Promise<Financement[]> {
    try {
      if (!projetId) {
        throw new Error('Pas d\'id projet.');
      }
      return await (this.http.get<Financement[]>(FinancementsService.Financement_URL+'/'+projetId).toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Put un financement d'un projet
   * @param projetId : l'id du projet
   * @param financement : le financement modifié
   */
  public async put(financement: Financement): Promise<Financement> {
    try {
      console.log(financement.id_f)
      if (isNaN(financement?.id_f)) {
        throw new Error('Pas d\'id financement.');
      }
      return await (this.http.put<Financement>(
        `${FinancementsService.Financement_URL}/${financement.id_f}`,
        financement
      )
      .toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Post un financement d'un projet
   * @param financement : le financement à ajouter
   */
  public async post(financement: Financement): Promise<Financement> {
    try {
      const newFinancement = await (this.http.post<Financement>(
        FinancementsService.Financement_URL, 
        financement
      ).toPromise());
      // Récupération de l'identifiant
      financement.id_f = newFinancement.id_f || 0;

      return newFinancement || financement;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Delete un financement d'un projet
   * @param financement : le financement à supprimer
   */
  public async delete(financement: Financement): Promise<Financement> {
    try {
      if (isNaN(financement?.id_f)) {
        throw new Error('Pas d\'id financement.');
      }
      return await (this.http.delete<Financement>(`${FinancementsService.Financement_URL}/${financement.id_f}`).toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
