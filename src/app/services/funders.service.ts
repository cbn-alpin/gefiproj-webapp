import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Financement } from '../models/financement';
import { Financeur } from './../models/financeur';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

/**
 * Gère les requêtes relatives aux financeurs.
 */
@Injectable({
  providedIn: 'root'
})
export class FinanceurService {
  /**
   * Url relative de l'API.
   */
  private readonly endPoint = '/api/funders';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Financeur>;

  /**
   * Effectue les appels au serveur d'API pour les financeurs.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private http: HttpClient,
    private spinnerSrv: SpinnerService) {
      this.crudSrv = new CrudService<Financeur>(
        http,
        spinnerSrv,
        this.endPoint);
  }

  /**
   * Retourne les financeurs depuis le serveur.
   */
  public async getAll(): Promise<Financeur[]> {
    return this.crudSrv.getAll();
  }

  /**
   * Retourne le financeur demandé depuis le serveur.
   * @param id : identifiant du financeur demandé.
   */
  public async get(id: number): Promise<Financeur> {
    return this.crudSrv.get(id);
  }

  /**
   * Transmet le financeur modifiéee au serveur.
   * @param funder : financeur modifié.
   */
  public async modify(funder: Financeur): Promise<Financeur> {
      return this.crudSrv.modify(
        funder,
        funder?.id_financeur);
  }

  /**
   * Transmet le nouveau financeur au serveur.
   * @param funder : financeur à créer.
   */
  public async add(funder: Financeur): Promise<Financeur> {
      return await this.crudSrv.add(funder);
  }

  /**
   * Demande la suppression du financeur au serveur.
   * @param funder : financeur à supprimer.
   */
  public async delete(funder: Financeur): Promise<void> {
    const id = funder?.id_financeur || 0;
    return this.crudSrv.delete(id);
  }

  /**
   * Retourne les financements du financeur en paramètre.
   * @param funder : financeur ciblé.
   */
  public async getFundings(funder: Financeur): Promise<Financement[]> {
    try {
      const fundersSrv = new CrudService<Financement>(
        this.http,
        this.spinnerSrv,
        `${this.endPoint}/${funder.id_financeur || 0}/fundings`
      );
      return fundersSrv.getAll();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
