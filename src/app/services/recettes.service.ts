import { Injectable } from '@angular/core';
import { Financement } from '../models/financement';
import { Recette } from '../models/recette';
import { CrudService } from './crud.service';
import { HttpClient } from '@angular/common/http';
import { SpinnerService } from './spinner.service';
import { getDeepCopy } from '../shared/tools/utils';

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

  public async add(recette: Recette): Promise<Recette> {
    const cleanRecette = this.cleanRecette(recette);
    try {
      if (cleanRecette) {
        return await this.crudSrv.add(cleanRecette);
      }
    } catch (error) {
      console.error(error);

      return Promise.reject('Impossible de créer la recette');
    }
  }

  public async modify(recette: Recette): Promise<Recette> {
    const cleanRecette = this.cleanRecette(recette);
    try {
      if (cleanRecette && cleanRecette.id_r) {
        return await this.crudSrv.modify(cleanRecette, cleanRecette.id_r);
      }
    } catch (error) {
      console.error(error);

      return Promise.reject('Impossible de modifier la recette');
    }
  }

  public async delete(recette: Recette): Promise<void> {
    const cleanRecette = this.cleanRecette(recette);
    try {
      if (cleanRecette && cleanRecette.id_r) {
        return await this.crudSrv.delete(cleanRecette.id_r);
      }
    } catch (error) {
      console.error(error);

      return Promise.reject('Impossible de supprimer la recette');
    }
  }

  public cleanRecette(recette: Recette): Recette {
    try {
      const copiedRecette = getDeepCopy(recette);
      delete copiedRecette.financement;
      delete copiedRecette.difference;

      return copiedRecette;
    } catch (error) {
      console.error(error);
    }
  }
}
