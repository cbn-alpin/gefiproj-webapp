import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Utilisateur } from './../models/utilisateur';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

/**
 * Effectue les appels au serveur d'API pour les utilisateurs.
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  /**
   * Url relative de l'API.
   */
  private readonly endPointGet = '/api/users';
  /**
   * Url relative de l'API.
   */
  private readonly endPointPost = '/api/auth/register';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Utilisateur>;
  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrvPost: CrudService<Utilisateur>;

  /**
   * Effectue les appels au serveur d'API pour les utilisateurs.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    http: HttpClient,
    spinnerSrv: SpinnerService) {
    this.crudSrv = new CrudService<Utilisateur>(
      http,
      spinnerSrv,
      this.endPointGet);
    this.crudSrvPost = new CrudService<Utilisateur>(
      http,
      spinnerSrv,
      this.endPointPost);
  }

  /**
   * Retourne les utilisateurs depuis le serveur.
   */
  public async getAll(): Promise<Utilisateur[]> {
    return this.crudSrv.getAll();
  }

  /**
   * Retourne le utilisateur demandé depuis le serveur.
   * @param id : identifiant du utilisateur demandé.
   */
  public async get(id: number): Promise<Utilisateur> {
    return this.crudSrv.get(id);
  }

  /**
   * Transmet le utilisateur modifié au serveur.
   * @param user : utilisateur modifié.
   */
  public async modify(user: Utilisateur): Promise<Utilisateur> {
    return this.crudSrv.modify(
      user,
      user?.id_u);
  }

  /**
   * Transmet le nouveau utilisateur au serveur.
   * @param user : utilisateur à créer.
   */
  public async add(user: Utilisateur): Promise<Utilisateur> {
    try {
      return await this.crudSrvPost.add(user);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
