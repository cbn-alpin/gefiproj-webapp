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
   * TODO : bouchonnage !
   */
  private get funders(): Financeur[] {
    return JSON.parse(localStorage.getItem('debugFinanceurService') || '[]') as Financeur[];
  }

  /**
   * TODO : bouchonnage !
   */
  private set funders(funders: Financeur[]) {
    localStorage.setItem('debugFinanceurService', JSON.stringify(funders || []));
  }

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
    return this.funders.slice();
    return this.crudSrv.getAll();
  }

  /**
   * Retourne le financeur demandé depuis le serveur.
   * @param id : identifiant du financeur demandé.
   */
  public async get(id: number): Promise<Financeur> {
    return this.funders.find(e => e.id_financeur === id) || null;
    return this.crudSrv.get(id);
  }

  /**
   * Transmet le financeur modifiéee au serveur.
   * @param funder : financeur modifié.
   */
  public async modify(funder: Financeur): Promise<Financeur> {
      const funders = this.funders;
      const index = funders.findIndex(e => e.id_financeur === funder.id_financeur);
      if (index >= 0) {
        funders[index] = funder;
        this.funders = funders;
      }
      return funder;
      return this.crudSrv.modify(
        funder,
        funder?.id_financeur);
  }

  /**
   * Transmet le nouveau financeur au serveur.
   * @param funder : financeur à créer.
   */
  public async add(funder: Financeur): Promise<Financeur> {
      const funders = this.funders;
      funder.id_financeur = funders.map(e => e.id_financeur).reduce((p, c) => Math.max(p, c), 0) + 1;
      funders.push(funder);
      this.funders = funders;
      return funder;
      return await this.crudSrv
        .add(funder);
  }

  /**
   * Demande la suppression du financeur au serveur.
   * @param funder : financeur à supprimer.
   */
  public async delete(funder: Financeur): Promise<void> {
    const funders = this.funders;
    const index = funders.findIndex(e => e.id_financeur === funder.id_financeur);
    if (index >= 0) {
      funders.splice(index, 1);
      this.funders = funders;
    }
    return;
    const id = funder?.id_financeur || 0;
    return this.crudSrv.delete(id);
  }

  /**
   * Retourne les financements du financeur en paramètre.
   * @param funder : financeur ciblé.
   */
  public async fundingsOf(funder: Financeur): Promise<Financement[]> {
    try {
      return [];
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
