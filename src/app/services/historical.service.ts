import { Historique } from './../models/historique';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SpinnerService } from './spinner.service';
import { CrudService } from './crud.service';

/**
 * Effectue les appels au serveur d'API pour obtenir l'historique des modifications.
 */
@Injectable({
  providedIn: 'root'
})
export class HistoricalService {
  /**
   * Adresse relative de de l'API.
   */
  private endPoint = `/api/modifications`;

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Historique>;

  /**
   * Effectue les appels au serveur d'API pour les financeurs.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    http: HttpClient,
    spinnerSrv: SpinnerService) {
      this.crudSrv = new CrudService<Historique>(
        http,
        spinnerSrv,
        this.endPoint);
  }

  /**
   * Retourne l'historique depuis le serveur.
   */
  public async getAll(): Promise<Historique[]> {
    return [{ // todo à brancher sur API !
      id_h: 1,
      user: {id_u: 2, nom_u: 'nom', prenom_u: 'prenom', initiales_u: 'initiale', email_u: 'mail', active_u: true},
      project: {id_p: 3, code_p: 20001, nom_p: 'nom projet', statut_p: false},
      date_h: new Date(2020, 0, 1),
      description_h: JSON.stringify({
        modification: 'C',
        table: 'P',
        message: 'une info..'
      })
    },
    {
      id_h: 2,
      user: {id_u: 2, nom_u: 'nom2', prenom_u: 'prenom2', initiales_u: 'initiale2', email_u: 'mail2', active_u: true},
      project: {id_p: 4, code_p: 20002, nom_p: 'nom projet2', statut_p: false},
      date_h: new Date(2020, 9, 1),
      description_h: JSON.stringify({
        modification: 'D',
        table: 'F',
        message: 'une info2..'
      })
    },
    {
      id_h: 3,
      user: {id_u: 3, nom_u: 'nom3', prenom_u: 'prenom3', initiales_u: 'initiale3', email_u: 'mail3', active_u: true},
      project: {id_p: 8, code_p: 20003, nom_p: 'nom projet3', statut_p: false},
      date_h: new Date(2020, 8, 1),
      description_h: JSON.stringify({
        modification: 'U',
        table: 'R',
        message: 'une info3..'
      })
    },
    {
      id_h: 4,
      user: {id_u: 4, nom_u: 'nom4', prenom_u: 'prenom4', initiales_u: 'initiale4', email_u: 'mail4', active_u: true},
      project: {id_p: 7, code_p: 20004, nom_p: 'nom projet4', statut_p: false},
      date_h: new Date(2021, 8, 1),
      description_h: JSON.stringify({
        modification: 'U',
        table: 'A',
        message: 'une info4..'
      })
    }];
    return this.crudSrv.getAll();
  }
}
