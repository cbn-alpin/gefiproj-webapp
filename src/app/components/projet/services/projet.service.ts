import {Injectable} from '@angular/core';
import {Recette} from "../../../models/recette";
import {HttpClient} from "@angular/common/http";
import {SpinnerService} from "../../../services/spinner.service";
import {Financement} from "../../../models/financement";
import {CrudService} from "../../../services/crud.service";

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  /**
   * Url de base de l'API.
   */
  private readonly baseApiEndPoint = '/api/';
  private readonly baseProjetEndPoint = 'projects/';
  private readonly baseFinancementEndPoint = 'fundings/';
  private readonly baseRecetteEndPoint = 'receipts/';

  /**
   * Url crud de l'API
   */
  private readonly recettesEndPoint = this.baseApiEndPoint + this.baseRecetteEndPoint;

  /**
   * Effectue les appels recettes au serveur d'API
   */
  private readonly recettesCrudService: CrudService<Recette>;

  /**
   * Effectue les appels au serveur d'API pour un projet.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    private http: HttpClient,
    private spinnerSrv: SpinnerService) {
    this.recettesCrudService = new CrudService<Recette>(
      this.http,
      this.spinnerSrv,
      this.recettesEndPoint);
  }
  /**
   * Retourne la liste des financements associées au projet ayant pour id idProjet
   * @param idProjet
   */
  public getAllFinancementsFromProjet(idProjet: number): Promise<Financement[]> {
    try {
      const endPoint = this.baseApiEndPoint + this.baseProjetEndPoint + idProjet + '/' + this.baseFinancementEndPoint;
      const crudSrv = new CrudService<Financement>(
        this.http,
        this.spinnerSrv,
        endPoint);
      const res = crudSrv.getAll();

      return res;
    } catch (error) {
      console.error(error);
      return Promise.reject("Impossible de charger les financements");
    }
  }

  /**
   * Retourne la liste des recettes associées au financement ayant pour id idFinancement
   * @param idFinancement
   */
  public getAllRecettesFromFinancement(financement: Financement): Promise<Recette[]> {
    try {
      const endPoint = this.baseApiEndPoint + this.baseFinancementEndPoint + financement.id_f + '/' + this.baseRecetteEndPoint;
      const crudSrv = new CrudService<Recette>(
        this.http,
        this.spinnerSrv,
        endPoint);
      const res = crudSrv.getAll();

      return res;
    } catch (error) {
      console.error(error);
      return Promise.reject("Impossible de charger les recettes");
    }
  }

  /**
   * Ajoute une recette à un financement
   * @param recette
   * @param idFinancement
   * @param redettes
   */
  public async addRecetteToFinancement(recette: Recette, financement: Financement, recettes: Recette[]): Promise<Recette> {
    if (!this.newOrUpdatedRecetteEqualToMontantFinancement(recette, financement, recettes)) {
      return Promise.reject("La somme des recettes n'est pas égale au montant arrêté du financement");
    } else if (!this.newOrUpdatedRecetteYearMustBePriorToYearFinancement(recette, financement)) {
      return Promise.reject("L'année de la recette doit être antérieur à la date de commande ou d'arrêté du financement");
    }
    else {
      try {
        recette.fundingId = financement.id_f;
        recette.id_f = financement.id_f;
        const newRecette = await this.recettesCrudService.add(recette);
        recette.id_f = financement.id_f;

        // Récupération de l'identifiant
        newRecette.id_r = recette.id_r = newRecette?.id_r
          || (newRecette as any)?.id // gestion de json-server
          || recette?.id_r
          || (recette as any)?.id // gestion de json-server
          || 0;

        return newRecette || recette;
      } catch (error) {
        console.error(error);
        return Promise.reject("Impossible de créer la recette");
      }
    }
  }

  /**
   * Transmet la recette modifié au serveur.
   * @param recette : recette modifié.
   */
  public async modifyRecette(recette: Recette, financement: Financement, recettes: Recette[]): Promise<Recette> {
    if (!this.newOrUpdatedRecetteEqualToMontantFinancement(recette, financement, recettes)) {
      return Promise.reject("La somme des recettes n'est pas égale au montant arrêté du financement");
    } else if (!this.newOrUpdatedRecetteYearMustBePriorToYearFinancement(recette, financement)) {
      return Promise.reject("L'année de la recette doit être antérieur à la date de commande ou d'arrêté du financement");
    }
    else {
      try {
        const res = await this.recettesCrudService.modify(
          recette,
          recette.id_r);

        return res;
      } catch (error) {
        return Promise.reject("Impossible de modifier la recette");
      }
    }
  }

  /**
   * Demande la suppression d'une recette au serveur.
   * @param recette : recette à supprimer.
   */
  public async deleteRecette(recette: Recette): Promise<Recette> {
    try {
      const id = recette?.id_r || (recette as any)?.id; // Pour json-server
      await this.recettesCrudService.delete(id);

      recette.id_r = id;

      return {...recette, id_r: id};
    } catch (error) {
      return Promise.reject("Impossible de supprimer la recette");
    }
  }

  /**
   * Vérifier que la somme des recettes est inférieur ou égale au montant affecté du financement lors de la mise à jour d'une recette
   * ou encore lors de l'ajout d'une recette
   * @param newOrUpdatedRecette, nouvelle recette ou recette mis à jour
   * @param financement
   * @param recettes, liste des recettes liès au financement
   */
  public newOrUpdatedRecetteEqualToMontantFinancement(newOrUpdatedRecette: Recette, financement: Financement, recettes: Recette[]): boolean {
    let sumMontantRecettes = 0;
    recettes.forEach((recette) => {
      const id = recette?.id_r || (recette as any)?.id; // Pour json-server
      if (newOrUpdatedRecette.id_r !== id) { // cas où la recette est mis à jour
        sumMontantRecettes += recette.montant_r;
      }
    });

    return newOrUpdatedRecette.montant_r + sumMontantRecettes <= financement.montant_arrete_f;
  }

  /**
   * Vérifier que la date de la recette soit antérieur à la date de commande ou d'arrêté
   * @param newOrUpdatedRecette
   * @param financement
   */
  public newOrUpdatedRecetteYearMustBePriorToYearFinancement(newOrUpdatedRecette: Recette, financement: Financement): boolean {
    let dateSoldeFinancement: Date;
    let dateArreteFinancement: Date;
    if (!(financement.date_solde_f instanceof  Date)) {
      dateSoldeFinancement = this.convertDateStringToFrenchDateFormat(String(financement.date_solde_f));
    } else {
      dateSoldeFinancement = financement.date_solde_f;
    }
    if (!(financement.date_arrete_f instanceof  Date)) {
      dateArreteFinancement = this.convertDateStringToFrenchDateFormat(String(financement.date_arrete_f));
    } else {
      dateArreteFinancement = financement.date_arrete_f;
    }
    const yearDateSoldeFinancement = dateSoldeFinancement.getFullYear();
    const yearDateArreteFinancement = dateArreteFinancement.getFullYear();

    return newOrUpdatedRecette.annee_r < yearDateSoldeFinancement  &&  newOrUpdatedRecette.annee_r  < yearDateArreteFinancement;
  }

  /**
   * Convertis une chaîne de caractère correspondant à une date française vers un objet Date au format français.
   * @param date
   * @private
   */
  public convertDateStringToFrenchDateFormat(date: string): Date {
    var dateParts = date.split("/");
    var dateObject = new Date(+dateParts[2], +dateParts[1] - 1, +dateParts[0]);

    return dateObject;
  }

}
