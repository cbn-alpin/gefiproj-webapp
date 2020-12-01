import { Injectable } from '@angular/core';
import {Recette} from "../../../models/recette";
import {HttpClient} from "@angular/common/http";
import {SpinnerService} from "../../../services/spinner.service";
import {Projet} from "../../../models/projet";

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  /**
   * Url relative de l'API.
   */
  private readonly financementEndPoint = '/api/funding/';


  /**
   * Effectue les appels au serveur d'API pour un projet.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private http: HttpClient,
    private spinnerSrv: SpinnerService) { }

  /**
   * Retourne la liste des recettes associées au financement ayant pour id idFinancement
   * @param idFinancement
   */
  public async getRecettesFromFinancement(idFinancement: string): Promise<Recette[]> {
    try {
      this.spinnerSrv.show();
      return await (this.http
        .get<Recette[]>(this.financementEndPoint + idFinancement + '/receipts')
        .toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }
}
