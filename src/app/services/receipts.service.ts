import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Recette } from '../models/recette';
import { getDeepCopy } from '../shared/tools/utils';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

/**
 * Gère les requêtes liées aux recettes.
 */
@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  /**
   * Url relative de l'API.
   */
  public static readonly endPoint = '/api/receipts';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Recette>;

  /**
   * Effectue les appels au serveur d'API pour les recettes.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private readonly http: HttpClient,
    private readonly spinnerSrv: SpinnerService) {
    this.crudSrv = new CrudService<Recette>(http, spinnerSrv, ReceiptsService.endPoint);
  }

  /**
   * Retourne les recettes du financment indiqué.
   * @param idFunding : identifiant du financement ciblé.
   */
  public getAllFromFunding(idFunding: number): Promise<Recette[]> {
    try {
      if (idFunding) {
        const endPoint = `/api/fundings/${idFunding}/receipts`;
        const crudSrv = new CrudService<Recette>(
          this.http,
          this.spinnerSrv,
          endPoint
        );

        return crudSrv.getAll();
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Transmet la nouvelle recette au serveur.
   * @param receipt : recette à créer.
   */
  public async add(receipt: Recette): Promise<Recette> {
    const cleanRecette = this.cleanReceipt(receipt);
    try {
      if (cleanRecette) {
        return await this.crudSrv.add(cleanRecette);
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Transmet la recette modifiée au serveur.
   * @param receipt : recette à modifier.
   */
  public async modify(receipt: Recette): Promise<Recette> {
    const cleanRecette = this.cleanReceipt(receipt);
    try {
      if (cleanRecette && cleanRecette.id_r) {
        return await this.crudSrv.modify(cleanRecette, cleanRecette.id_r);
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Demande la suppression de la recette au serveur.
   * @param receipt : recette à supprimer.
   */
  public async delete(receipt: Recette): Promise<void> {
    const cleanRecette = this.cleanReceipt(receipt);
    try {
      if (cleanRecette && cleanRecette.id_r) {
        return await this.crudSrv.delete(cleanRecette.id_r);
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Supprime les propriétés non attendues par le serveur.
   * @param receipt : recette à nettoyer.
   */
  public cleanReceipt(receipt: Recette): Recette {
    try {
      const copiedRecette = getDeepCopy(receipt);
      delete copiedRecette.financement;
      delete copiedRecette.difference;

      return copiedRecette;
    } catch (error) {
      console.error(error);
    }
  }
}
