import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MontantAffecte } from '../models/montantAffecte';
import { Recette } from '../models/recette';
import { CrudService } from './crud.service';
import { ReceiptsService } from './receipts.service';
import { SpinnerService } from './spinner.service';

/**
 * Gère les requêtes liées aux montants affectés.
 */
@Injectable({
  providedIn: 'root'
})
export class AmountsService {
  /**
   * Url relative de l'API Recette
   */
  public readonly rEndPoint = ReceiptsService.endPoint;

  /**
   * Url relative de l'API MontantsAffectés
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
   * Retourne les montants affectés depuis une recette en paramètre depuis le serveur.
   * @param receiptId : l'id de la recette.
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
   * Retourne les montants affectés de la recette indiquée depuis le serveur.
   * @param receiptId : L'id de la recette
   */
  public async getAmounts(receiptId: number): Promise<MontantAffecte[]> {
    try {
      const amountSrv = new CrudService<MontantAffecte>(
        this.http,
        this.spinnerSrv,
        `${this.rEndPoint}/${receiptId}/amounts`);

      return amountSrv.getAll();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  /**
   * Transmet le montant affecté modifié au serveur.
   * @param montant : le montant affecté modifié
   */
  public async modify(montant: MontantAffecte): Promise<MontantAffecte> {
    return this.crudSrv.modify(
      montant,
      montant?.id_ma);
  }

  /**
   * Transmet le montant affecté au serveur.
   * @param montant : le montant affecté à créer
   * @param receiptId : La recette de ce montant affecté
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
   * Demande la suppression d'un montant affecté au serveur.
   * @param montant : le montant affecté à supprimer
   */
  public async delete(montant: MontantAffecte): Promise<void> {
    return this.crudSrv.delete(montant.id_ma);
  }
}
