import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecetteComptable } from '../models/recette-comptable';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

/**
 * Gère les requêtes liées aux recettes comptables.
 */
@Injectable({
  providedIn: 'root'
})
export class AccountingsService {
  /**
   * Url relative de l'API.
   */
  private readonly endPoint = '/api/receipts/accountings';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<RecetteComptable>;

  /**
   * Effectue les appels au serveur d'API pour les recettes comptables.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(http: HttpClient, spinnerSrv: SpinnerService) {
    this.crudSrv = new CrudService<RecetteComptable>(http, spinnerSrv, this.endPoint);
  }

  /**
   * Retourne les recettes comptables depuis le serveur.
   */
  public async getAll(): Promise<RecetteComptable[]> {
    return this.crudSrv.getAll();
  }

  /**
   * Retourne la recette comptable demandée depuis le serveur.
   * @param id : identifiant de la recette comptable demandée.
   */
  public async get(id: number): Promise<RecetteComptable> {
    return this.crudSrv.get(id);
  }

  /**
   * Transmet la recette comptable modifiée au serveur.
   * @param accounting : recette comptable modifiée.
   */
  public async modify(accounting: RecetteComptable): Promise<RecetteComptable> {
    return this.crudSrv.modify(accounting, accounting?.id_rc);
  }

  /**
   * Transmet la nouvelle recette comptable au serveur.
   * @param accounting : recette comptable à créer.
   */
  public async add(accounting: RecetteComptable): Promise<RecetteComptable> {
    return await this.crudSrv.add(accounting);
  }

  /**
   * Demande la suppression de la recette comptable au serveur.
   * @param accounting : recette comptable à supprimer.
   */
  public async delete(accounting: RecetteComptable): Promise<void> {
    const id = accounting?.id_rc || 0;
    return this.crudSrv.delete(id);
  }
}
