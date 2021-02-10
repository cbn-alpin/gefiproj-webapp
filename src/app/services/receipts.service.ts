import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Recette } from '../models/recette';
import { getDeepCopy } from '../shared/tools/utils';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

/**
 * Gère les recettes avec le serveur d'API.
 */
@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  /**
   * End-point.
   */
  private readonly endPoint = '/api/receipts';

  /**
   * Gère les requêtes.
   */
  private readonly crudSrv: CrudService<Recette>;

  /**
   * Gère les recettes avec le serveur d'API.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private readonly http: HttpClient,
    private readonly spinnerSrv: SpinnerService) {
    this.crudSrv = new CrudService<Recette>(http, spinnerSrv, this.endPoint);
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

      return Promise.reject('Impossible de charger les recettes');
    }
  }

  /**
   * Ajoute une recette.
   * @param receipt : recette à ajouter.
   */
  public async add(receipt: Recette): Promise<Recette> {
    const cleanRecette = this.cleanReceipt(receipt);
    try {
      if (cleanRecette) {
        return await this.crudSrv.add(cleanRecette);
      }
    } catch (error) {
      console.error(error);

      return Promise.reject('Impossible de créer la recette');
    }
  }

  /**
   * Modifie une recette.
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

      return Promise.reject('Impossible de modifier la recette');
    }
  }

  /**
   * Supprime une recette.
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

      return Promise.reject('Impossible de supprimer la recette');
    }
  }

  /**
   * Supprime les propriétés supplémentaires.
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
