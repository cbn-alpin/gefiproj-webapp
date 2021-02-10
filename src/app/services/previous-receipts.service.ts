import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntreeSortie } from '../models/entrees-sorties';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

/**
 * Gère les entrées-sorties avec l'API.
 */
@Injectable({
  providedIn: 'root'
})
export class PreviousReceiptsService {

  /**
   * Url relative de l'API Entrées/Sorties
   */
  public readonly EndPoint = '/api/receipts/previous';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudService: CrudService<EntreeSortie>;
  /**
   * Effectue les appels au serveur d'API pour les Entrées/Sorties.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    http: HttpClient,
    spinnerSrv: SpinnerService,
  ) {
    this.crudService = new CrudService<EntreeSortie>(
      http,
      spinnerSrv,
      this.EndPoint);
  }

  /**
   * Retourne toutes les entrées/sorties.
   */
  public async getAll(): Promise<EntreeSortie[]> {
    try {
      return this.crudService.getAll();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
  /**
   * Retourne l'entrée/sortie demandée depuis le serveur.
   * @param id : identifiant de l'entrée/sortie demandée.
   */
  public async get(id: number): Promise<EntreeSortie> {
    return this.crudService.get(id);
  }

  /**
   * Transmet l'entrée/sortie modifiée au serveur.
   * @param inOut : l'entrée/sortie  modifiée.
   */
  public async modify(inOut: EntreeSortie): Promise<EntreeSortie> {
    return this.crudService.modify(
      inOut,
      inOut?.id_es);
  }
  /**
   * Transmet la nouvelle entrée/sortie au serveur.
   * @param inOut : entrée/sortie à créer.
   */
  public async add(inOut: EntreeSortie): Promise<EntreeSortie> {
    return await this.crudService
      .add(inOut);
  }

  /**
   * Demande la suppression de l'entrée/sortie au serveur.
   * @param inOut : entrée/sortie à supprimer.
   */
  public async delete(inOut: EntreeSortie): Promise<void> {
    const id = inOut?.id_es || 0;
    return this.crudService.delete(id);
  }
}
