import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Financeur } from '../models/financeur';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceurService {
  /**
   * Url relative de l'API.
   */
  private readonly endPoint = '/api/funder';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Financeur>;

  /**
   * Effectue les appels au serveur d'API pour les financeur.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    http: HttpClient,
    spinnerSrv: SpinnerService
    ) {
      this.crudSrv = new CrudService<Financeur>(http, spinnerSrv, this.endPoint);
  }

  /**
   * Retourne les financeurs depuis le serveur.
   */
  public async getAll(): Promise<Financeur[]> {
    return this.crudSrv.getAll('id_financeur');
  }
}
