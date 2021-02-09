import { environment } from './../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './authentication/auth.service';
import { SpinnerService } from './spinner.service';

/**
 * Gère le CRUD avec le serveur d'API.
 * @template T : type de l'entité gérée.
 */
export class CrudService<T> {
  /**
   * Effectue les appels au serveur d'API pour une entité.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   * @param endPoint : Url relative de l'API.
   */
  constructor(
    private http: HttpClient,
    private spinnerSrv: SpinnerService,
    private endPoint: string
  ) {
    this.endPoint = `${environment.backendServer}${this.endPoint || '/'}`;
  }

  /**
   * Retourne les entités depuis le serveur.
   * @param params : paramètres HTTP.
   */
  public async getAll(params?: HttpParams): Promise<T[]> {
    try {
      this.spinnerSrv.show();

      const observable = this.http.get<T[]>(this.endPoint, {
        observe: 'response',
        params,
      });
      const response = await observable.toPromise();
      const items = response?.body || [];

      return items || [];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Retourne l'entité demandée depuis le serveur.
   * @param id : identifiant de l'entité demandée.
   */
  public async get(id: number): Promise<T> {
    try {
      this.spinnerSrv.show();

      if (isNaN(id) || id <= 0) {
        throw new Error('Pas d\'identifiant valide.');
      }

      const url = `${this.endPoint}/${id}`;
      const observable = this.http.get<T>(url, { observe: 'response' });
      const response = await observable.toPromise();

      return response?.body || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Transmet l'entité modifiée au serveur.
   * @param item : entité modifiée.
   * @param id : identifiant de l'entité modifiée.
   */
  public async modify(item: T, id: number): Promise<T> {
    try {
      this.spinnerSrv.show();

      if (!item) {
        throw new Error('Pas de données en paramètre.');
      }

      if (isNaN(id) || id <= 0) {
        throw new Error('Pas d\'identifiant valide.');
      }

      const url = `${this.endPoint}/${id}`;
      const observable = this.http.put<T>(url, item, {
        headers: new HttpHeaders(AuthService.headers),
        observe: 'response',
      });
      const response = await observable.toPromise();

      return response?.body || item;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Transmet la nouvelle entité au serveur.
   * @param item : entité à créer.
   */
  public async add(item: T): Promise<T> {
    try {
      this.spinnerSrv.show();

      if (!item) {
        throw new Error('Pas de données en paramètre.');
      }

      const observable = this.http.post<T>(this.endPoint, item, {
        headers: new HttpHeaders(AuthService.headers),
        observe: 'response',
      });
      const response = await observable.toPromise();

      return response?.body || item;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Demande la suppression de l'entité au serveur.
   * @param id : identifiant de l'entité à supprimer.
   */
  public async delete(id: number): Promise<void> {
    try {
      this.spinnerSrv.show();

      if (isNaN(id) || id <= 0) {
        throw new Error('Pas d\'indentifiant valide.');
      }

      const url = `${this.endPoint}/${id}`;
      const observable = this.http.delete<T>(url, { observe: 'response' });
      await observable.toPromise();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }
}
