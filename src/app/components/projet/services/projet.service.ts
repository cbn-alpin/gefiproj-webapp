import {Injectable} from '@angular/core';
import {Recette} from "../../../models/recette";
import {HttpClient} from "@angular/common/http";
import {SpinnerService} from "../../../services/spinner.service";

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
      const test = await (this.http
        .get<Recette[]>('/api/fundings/1/receipts')
        .toPromise());
      console.log("TEST:", test);
      return test;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }
}
