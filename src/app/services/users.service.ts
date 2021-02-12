import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Utilisateur } from './../models/utilisateur';
import { AuthService } from './authentication/auth.service';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

/**
 * Effectue les appels au serveur d'API pour les utilisateurs.
 */
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  /**
   * Url relative de l'API Utilisateurs.
   */
  private readonly endPointUser = '/api/users';

  /**
   * Url relative de l'API Authentification.
   */
  private readonly endPointAuth = `${environment.backendServer}/api/auth/register`;

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Utilisateur>;

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrvPost: CrudService<Utilisateur>;

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private crudSrvChange: CrudService<Utilisateur>;

  /**
   * Effectue les appels au serveur d'API pour les utilisateurs.
   * @param spinnerSrv : gère le spinner/sablier.
   * @param authSrv : gère l'authentification.
   * @param http : permet d'effectuer les appels au serveur d'API.
   */
  constructor(
    private readonly spinnerSrv: SpinnerService,
    private readonly authSrv: AuthService,
    private readonly http: HttpClient
  ) {
    this.crudSrv = new CrudService<Utilisateur>(
      http,
      spinnerSrv,
      this.endPointUser
    );
    this.crudSrvPost = new CrudService<Utilisateur>(
      http,
      spinnerSrv,
      this.endPointAuth
    );
  }

  /**
   * Retourne les utilisateurs depuis le serveur.
   */
  public async getAll(params?: HttpParams): Promise<Utilisateur[]> {
    return this.crudSrv.getAll(params);
  }

  /**
   * Retourne l'utilisateur demandé depuis le serveur.
   * @param id : identifiant de l'utilisateur demandé.
   */
  public async get(id: number): Promise<Utilisateur> {
    return this.crudSrv.get(id);
  }

  /**
   * Transmet l'utilisateur modifié au serveur.
   * @param user : utilisateur modifié.
   */
  public async modify(user: Utilisateur): Promise<Utilisateur> {
    return this.crudSrv.modify(user, user?.id_u);
  }

  /**
   * Transmet l'utilisateur avec son mot de passe modifié au serveur.
   * @param user : utilisateur modifié.
   */
  public async modifyPwd(user: Utilisateur): Promise<Utilisateur> {
    this.crudSrvChange = new CrudService<Utilisateur>(
      this.http,
      this.spinnerSrv,
      `${this.endPointUser}/${user.id_u}/change-password`
    );

    return this.crudSrvChange.add(
      // Via POST
      user
    );
  }

  /**
   * Transmet le nouvel utilisateur au serveur.
   * @param user : utilisateur à créer.
   */
  public async add(user: Utilisateur): Promise<Utilisateur> {
    try {
      this.spinnerSrv.show();
      const accessToken = this.authSrv.accessToken;
      const headers = Object.assign(
        {
          Authorization: `Bearer ${accessToken}`,
        },
        AuthService.headers
      );

      return (await this.http
        .post(this.endPointAuth, user, {
          headers: new HttpHeaders(headers),
        })
        .toPromise()) as Utilisateur;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }
}
