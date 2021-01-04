import { SpinnerService } from './spinner.service';
import { Utilisateur } from './../models/utilisateur';
import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { HttpClient } from '@angular/common/http';

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
  private readonly endPoint = '/api/users';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Utilisateur>;

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
        this.endPoint);
    }

  /**
   * Retourne les utilisateurs depuis le serveur.
   */
  public async getAll(): Promise<Utilisateur[]> {
    return this.crudSrv.getAll('id_u');
  }

  /**
   * Retourne le utilisateur demandé depuis le serveur.
   * @param id : identifiant du utilisateur demandé.
   */
  public async get(id: number): Promise<Utilisateur> {
    return this.crudSrv.get(id, 'id_u');
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
      return await this.crudSrv.add(user, 'id_u');
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
