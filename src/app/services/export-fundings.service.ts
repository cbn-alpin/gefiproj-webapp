import { environment } from './../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ExportFundingsRequest } from '../models/export-fundings-request';
import { ExportFundingsResponse } from '../models/export-fundings-response';
import { AuthService } from './authentication/auth.service';
import { SpinnerService } from './spinner.service';

/**
 * Production du bilan de suivi des financements.
 */
@Injectable({
  providedIn: 'root'
})
export class ExportFundingsService {
  private endPoint = `${environment.backendServer}/api/export/fundings`;

  /**
   * Effectue les appels au serveur d'API pour la production d'un document Google Sheets relatif au bilan de suivi des financements.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private http: HttpClient,
    private spinnerSrv: SpinnerService
  ) { }

  /**
   * Crée le bilan de suivi des financement version 1 et retourne l'URL du document Google Sheets correspondant.
   */
  public async createExportV1(): Promise<string> {
    try {
      this.spinnerSrv.show();
      const params: ExportFundingsRequest = {
        version: 1,
        annee_ref: new Date(Date.now()).getFullYear(),
        annee_max: 0
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
      console.log(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Crée le bilan de suivi des financement version 2 et retourne l'URL du document Google Sheets correspondant.
   * @param minPeriod : début de période de référence.
   * @param maxPeriod : fin de période de référence.
   */
  public async createExportV2(minPeriod: number, maxPeriod: number): Promise<string> {
    try {
      this.spinnerSrv.show();

      const min = 2010;
      const max = Math.max((minPeriod || 0) + 1, min) + 30;
      if (isNaN(minPeriod) || isNaN(maxPeriod) || minPeriod > maxPeriod || minPeriod < min || maxPeriod > max) {
        throw new Error(`La période définie est incorrecte (plage autorisée : [${min};${max}])`);
      }

      const params: ExportFundingsRequest = {
        version: 2,
        annee_ref: minPeriod,
        annee_max: maxPeriod
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
      console.log(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }
}
