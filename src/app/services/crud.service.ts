import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    private endPoint: string) { }

  /**
   * Retourne les entités depuis le serveur.
   */
  public async getAll(id?:number): Promise<T[]> {
    try {
      this.spinnerSrv.show();
      let url = `${this.endPoint}`;
      if (id) {
        url = `${this.endPoint}/${id}`;
      } 
      return await (this.http
        .get<T[]>(url)
        .toPromise());
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

      if (isNaN(id)) {
        throw new Error('Pas d\'identifiant valide.');
      }

      const url = `${this.endPoint}/${id}`;
      return await (this.http
        .get<T>(url)
        .toPromise());
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

      id = id || (item as any).id; // Pour json-server
      if (isNaN(id)) {
        throw new Error('Pas d\'identifiant valide.');
      }

      const url = `${this.endPoint}/${id}`;
      return await (this.http.put<T>(
        url,
        item, {
        headers: new HttpHeaders(AuthService.headers)
      })
        .toPromise());
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

      const newItem = await (this.http.post<T>(
      this.endPoint,
        //JSON.stringify(item), {
        item, {
        headers: new HttpHeaders(AuthService.headers)
      })
        .toPromise());

      return newItem || item;
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

      if (isNaN(id)) {
        throw new Error('Pas d\'indentifiant valide.');
      }

      const url = `${this.endPoint}/${id}`;
      await (this.http
        .delete<T>(url)
        .toPromise());
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }
}
