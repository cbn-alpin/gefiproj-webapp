import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Financement } from '../models/financement';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

@Injectable({
  providedIn: 'root'
})
export class FinancementsService {
  /**
   * Url relative de l'API.
   */
  public readonly endPoint = 'http://127.0.0.1:5000/api/funding';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Financement>;

  /**
   * Effectue les appels au serveur d'API pour les financements.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    http: HttpClient,
    spinnerSrv: SpinnerService) {
      this.crudSrv = new CrudService<Financement>(
        http,
        spinnerSrv,
        this.endPoint);
  }

  /**
   * Retourne les financements d'un projet depuis le
   * @param projetId : l'id du projet
   */
  public async getAll(id: number): Promise<Financement[]> {
    if (isNaN(id)) {
      throw new Error('Pas d\'identifiant valide.');
    }
    return this.crudSrv.getAll(id); // todo : Hanh, à voir avec Manu !!!!
  }

  /**
   * Transmet le financement d'un projet modifié au serveur.
   * @param financement : le financement modifié
   */
  public async put(financement: Financement): Promise<Financement> {
    return this.crudSrv.modify(
      financement,
      financement?.id_f);
  }

  /**
   * Transmet le financement d'un projet au serveur.
   * @param financement : le financement à créer
   */
  public async post(financement: Financement): Promise<Financement> {
    try {
      return this.crudSrv.add(financement, 'id_f');
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Demande la suppression d'un financement
   * @param financement : le financement à supprimer
   */
  public async delete(financement: Financement): Promise<void> {
    return this.crudSrv.delete(financement.id_f);
  }
}
