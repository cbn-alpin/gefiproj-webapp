import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ExportFundingsResponse } from '../models/export-fundings-response';
import { ExportReceiptsRequest } from './../models/export-receipts-request';
import { AuthService } from './authentication/auth.service';
import { SpinnerService } from './spinner.service';

/**
 * Effectue les appels au serveur d'API pour la production d'un document Google Sheets relatif au bilan financier.
 */
@Injectable({
  providedIn: 'root'
})
export class ExportReceiptsService {
  /**
   * Url relative de l'API.
   */
  private endPoint = `${environment.backendServer}/api/export/receipts`;

  /**
   * Effectue les appels au serveur d'API pour la production d'un document Google Sheets relatif au bilan financier.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private http: HttpClient,
    private spinnerSrv: SpinnerService
  ) { }

  /**
   * Crée le bilan financier et retourne l'URL du document Google Sheets correspondant.
   * @param year : année de référence.
   */
  public async createExport(year: number): Promise<string> {
    try {
      this.spinnerSrv.show();

      const min = 2010;
      const max = new Date(Date.now()).getFullYear() + 30;
      if (isNaN(year) || year < min || year > max) {
        throw new Error(`La date définie est incorrecte (plage autorisée : [${min};${max}])`);
      }

      const params: ExportReceiptsRequest = {
        annee_ref: year
      };

      const observable = this.http.post<ExportFundingsResponse>(this.endPoint, params, {
        headers: new HttpHeaders(AuthService.headers),
        observe: 'response',
      });
      const response = await observable.toPromise();
      const body = response.body;

      if (body?.message && !body.url) { // Il y a un message d'erreur
        return Promise.reject(new Error(body.message));
      }

      return body?.url || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }
}
