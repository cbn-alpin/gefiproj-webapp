import { Injectable } from '@angular/core';
import { Financement } from '../models/financement';
import { Recette } from '../models/recette';
import { CrudService } from './crud.service';
import { HttpClient } from '@angular/common/http';
import { SpinnerService } from './spinner.service';

@Injectable({
  providedIn: 'root',
})
export class RecettesService {
  private readonly endPoint = '/api/receipts';
  private readonly crudSrv: CrudService<Recette>;

  constructor(private http: HttpClient, private spinnerSrv: SpinnerService) {
    this.crudSrv = new CrudService<Recette>(http, spinnerSrv, this.endPoint);
  }

  public getAll(financementId: number): Promise<Recette[]> {
    try {
      if (financementId) {
        const endPoint = `/api/fundings/${financementId}/receipts`;
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

  public async add(
    recette: Recette,
    financement: Financement,
    recettes: Recette[]
  ): Promise<Recette> {
    await this.checkErrors(recette, financement, recettes);
    try {
      if (recette) {
        return await this.crudSrv.add(recette);
      }
    } catch (error) {
      console.error(error);

      return Promise.reject('Impossible de créer la recette');
    }
  }

  public async modify(
    recette: Recette,
    financement: Financement,
    recettes: Recette[]
  ): Promise<Recette> {
    this.cleanRecette(recette);
    await this.checkErrors(recette, financement, recettes);
    try {
      if (recette && recette.id_r) {
        return await this.crudSrv.modify(recette, recette.id_r);
      }
    } catch (error) {
      console.error(error);

      return Promise.reject('Impossible de modifier la recette');
    }
  }

  public async delete(recette: Recette): Promise<void> {
    try {
      if (recette && recette.id_r) {
        return await this.crudSrv.delete(recette.id_r);
      }
    } catch (error) {
      console.error(error);

      return Promise.reject('Impossible de supprimer la recette');
    }
  }

  /**
   * Vérifier le montant et la date de la recette
   * @param recette
   * @param financement
   * @param recettes
   * @private
   */
  private checkErrors(
    recette: Recette,
    financement: Financement,
    recettes: Recette[]
  ): Promise<boolean> {
    if (!this.hasValidAmount(recette, financement, recettes)) {
      return Promise.reject(
        'La somme des recettes est supérieur au montant arrêté du financement'
      );
    } else if (!this.hasValidDate(recette, financement)) {
      return Promise.reject(
        "L'année de la recette doit être antérieur à la date de commande ou d'arrêté du financement"
      );
    }
  }

  /**
   * Vérifier que la somme des recettes est inférieur ou égale au montant affecté du financement
   * @param financement.
   * @param recettes.
   */
  private hasValidAmount(
    recette: Recette,
    financement: Financement,
    recettes: Recette[]
  ): boolean {
    let sum = 0;
    recettes.forEach((_recette, index) => {
      // TODO: Certains montant ont pour type: string
      if (_recette.id_r !== recette.id_r) {
        sum += +_recette.montant_r;
      }
    });
    return +recette.montant_r + sum <= financement.montant_arrete_f;
  }

  /**
   * Vérifier que la date de la recette soit antérieur à la date de commande ou d'arrêté
   * @param recette
   * @param financement
   */
  private hasValidDate(recette: Recette, financement: Financement): boolean {
    const yearDateArreteFinancement = new Date(
      financement.date_arrete_f
    ).getFullYear();
    // TODO: Dans le Back certaines date sont null
    return financement.date_arrete_f
      ? recette.annee_r < yearDateArreteFinancement
      : true;
  }

  private cleanRecette(recette: Recette): void {
    try {
      delete recette.financement;
      delete recette.difference;
    } catch (error) {
      console.error(error);
    }
  }
}
