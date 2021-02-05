import { Historique } from './../models/historique';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SpinnerService } from './spinner.service';
import { CrudService } from './crud.service';

/**
 * Effectue les appels au serveur d'API pour obtenir l'historique des modifications.
 */
@Injectable({
  providedIn: 'root'
})
export class HistoricalService {
  private endPoint = `/api/modifications `;

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Historique>;

  /**
   * Effectue les appels au serveur d'API pour les financeurs.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    http: HttpClient,
    spinnerSrv: SpinnerService) {
      this.crudSrv = new CrudService<Historique>(
        http,
        spinnerSrv,
        this.endPoint);
  }

  /**
   * Retourne les financeurs depuis le serveur.
   */
  public async getAll(): Promise<Historique[]> {
    return [];
    return this.crudSrv.getAll();
  }
}
