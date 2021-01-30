import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  SuiviFinancement,
  SuiviFinancementDto
} from '../models/suivi-financement';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

@Injectable({
  providedIn: 'root',
})
export class SuiviFinancementsService {
  /**
   * Url relative de l'API.
   */
  private readonly endPoint = '/api/projects';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<SuiviFinancementDto>;

  /**
   * Effectue les appels au serveur d'API pour les projets.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(private http: HttpClient, private spinnerSrv: SpinnerService) {
    this.crudSrv = new CrudService<SuiviFinancementDto>(
      http,
      spinnerSrv,
      this.endPoint
    );
  }

  /**
   * Retourne suivi des financements v1 depuis le serveur.
   */
  public async getAllVersion1(): Promise<SuiviFinancement[]> {
    const dtos = await this.crudSrv.getAll();

    return this.dtoToModel(dtos);
  }

  /**
   * Retourne suivi des financements v2 depuis le serveur.
   */
  public async getAllVersion2(
    annee1: number,
    annee2: number
  ): Promise<SuiviFinancement[]> {
    const params = new HttpParams()
      .append('annee1', String(annee1))
      .append('annee2', String(annee2));
    const dtos = await this.crudSrv.getAll(params);

    return this.dtoToModel(dtos);
  }

  public dtoToModel(
    suiviFinancementDto: SuiviFinancementDto[]
  ): SuiviFinancement[] {
    return suiviFinancementDto.map((dto) => {
      const suiviFinancement: SuiviFinancement = {
        code_p: dto.projet.code_p,
        commentaire: dto.financement.commentaire_admin_f,
        date_arrete_f: dto.financement.date_arrete_f,
        date_limite_solde_f: dto.financement.date_limite_solde_f,
        imputation: dto.financement.imputation_f,
        initiales_u: dto.projet.responsable.initiales_u,
        montant_arrete_f: dto.financement.montant_arrete_f,
        nom_financeur: dto.financement.financeur.nom_financeur,
        nom_p: dto.projet.nom_p,
        numero_titre_f: dto.financement.numero_titre_f,
        recettes_annee_1: dto.recettes.recettes_annee_1,
        recettes_annee_2: dto.recettes.recettes_annee_2,
        recettes_annee_3: dto.recettes.recettes_annee_3,
        recettes_annee_4: dto.recettes.recettes_annee_4,
        recettes_apres_annee_4: dto.recettes.recettes_apres_annee_4,
        recettes_avant_annee_1: dto.recettes.recettes_avant_annee_1,
        statut_f: dto.financement.statut_f,
      };

      return suiviFinancement;
    });
  }
}
