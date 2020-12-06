import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ajax } from 'rxjs/ajax';
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
   * @param idName : nom de l'identifiant.
   */
  public async getAll(idName?: string): Promise<T[]> {
    try {
      this.spinnerSrv.show();

      const items = await (ajax
        .getJSON<T[]>(this.endPoint)
        .toPromise());

      // TODO à supprimer après suppression de json server !
      if (!idName) {
        return items || [];
      }

      return this.addIdNamedForItems(items || [], idName);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Injecte l'identifiant attendu par les entités métier.
   * @param items : éléments où faire l'injection de l'identifiant.
   * @param key : nom de la propriété identifiant.
   */
  private addIdNamedForItems(items: T[], key: string): T[] {
    try {
      return (items || [])
        .map(item =>
          this.addIdNamed(item, key));
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Injecte l'identifiant attendu par l'entité métier.
   * @param item : élément où faire l'injection de l'identifiant.
   * @param key : nom de la propriété identifiant.
   */
  private addIdNamed(item: T, key: string): T { // TODO à supprimer après suppression de json server !
    try {
      if (item) {
        item[key] = item[key]
          || (item as any).id
          || 0;
      }
    } catch (error) {
      console.error(error);
    }

    return item;
  }

  /**
   * Retourne l'entité demandée depuis le serveur.
   * @param id : identifiant de l'entité demandée.
   * @param idName : nom de l'identifiant.
   */
  public async get(id: number, idName?: string): Promise<T> {
    try {
      this.spinnerSrv.show();

      if (isNaN(id)) {
        throw new Error('Pas d\'identifiant valide.');
      }

      const url = `${this.endPoint}/${id}`;
      const item = await (this.http
        .get<T>(url)
        .toPromise());

      return idName // TODO à supprimer après suppression de json server !
        ? this.addIdNamed(item, idName)
        : item;
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
   * @param idName : nom de l'identifiant.
   */
  public async add(item: T, idName?: string): Promise<T> {
    try {
      this.spinnerSrv.show();

      if (!item) {
        throw new Error('Pas de données en paramètre.');
      }

      const newItem = await (this.http.post<T>(
        this.endPoint,
          item, {
          headers: new HttpHeaders(AuthService.headers)
        })
        .toPromise())
        || item;

      // TODO à supprimer après suppression de json server !
      if (!idName) {
        return newItem;
      }

      return idName
        ? this.addIdNamed(newItem, idName)
        : item;
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
