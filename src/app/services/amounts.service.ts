import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MontantAffecte } from '../models/montantAffecte';
import { Recette } from '../models/recette';
import { CrudService } from './crud.service';
import { ProjectsService } from './projects.service';
import { SpinnerService } from './spinner.service';
import {ReceiptsService} from './receipts.service';

@Injectable({
  providedIn: 'root'
})
export class AmountsService {
  /**
   * Url relative de l'API Recette
   */
  public readonly rEndPoint = ReceiptsService.endPoint;

  /**
   * Url relative de l'API.
   */
  public readonly aEndPoint = '/api/amounts';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<MontantAffecte>;

  /**
   * Effectue les appels au serveur d'API pour les montants affectés.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private http: HttpClient,
    private spinnerSrv: SpinnerService
    ) {
    this.crudSrv = new CrudService<MontantAffecte>(
      http,
      spinnerSrv,
      this.aEndPoint);
  }

  /**
   * Retourne les montants affectés depuis une recette en paramètre.
   * @param projetId : l'id du projet.
   */
  public async getAll(receiptId: number): Promise<MontantAffecte[]> {
    try {
      if (isNaN(receiptId)) {
        throw new Error('Pas d\'identifiant valide.');
      }

      const recette = {} as Recette;
      recette.id_r = receiptId;
      return this.getAmounts(receiptId);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Retourne les financements du projet indiqué.
   * @param project : projet ciblé.
   */
  public async getAmounts(receiptId: number): Promise<MontantAffecte[]> {
    try {
      const amountSrv = new CrudService<MontantAffecte>(
        this.http,
        this.spinnerSrv,
        `${this.rEndPoint}/${receiptId}/amounts`);

      // TODO méthode dans ReceiptServ
      return amountSrv.getAll();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Transmet le financement d'un projet modifié au serveur.
   * @param financement : le financement modifié
   */
  public async modify(montant: MontantAffecte): Promise<MontantAffecte> {
    return this.crudSrv.modify(
      montant,
      montant?.id_ma);
  }

  /**
   * Transmet le financement d'un projet au serveur.
   * @param financement : le financement à créer
   */
  public async add(montant: MontantAffecte, receiptId: number): Promise<MontantAffecte> {
    try {
      montant.id_r = receiptId;
      return this.crudSrv.add(montant);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Demande la suppression d'un financement
   * @param financement : le financement à supprimer
   */
  public async delete(montant: MontantAffecte): Promise<void> {
    return this.crudSrv.delete(montant.id_ma);
  }
}
