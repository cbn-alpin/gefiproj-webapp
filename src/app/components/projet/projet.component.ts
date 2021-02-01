import {Component, Inject, OnInit} from '@angular/core';
import { Financement } from "../../models/financement";
import { ProjetService } from "../../services/projet.service";
import { Recette } from "../../models/recette";
import { IsAdministratorGuardService } from '../../services/authentication/is-administrator-guard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import { ProjetsService } from '../../services/projets.service';
import { Projet } from '../../models/projet';
import { MontantsAffectesService } from "../../services/montants-affectes.service";
import { MontantAffecte } from "../../models/montantAffecte";
import { FinancementsService } from "../../services/financements.service";
import {MatCheckboxChange} from '@angular/material/checkbox';
import {Utilisateur} from '../../models/utilisateur';
import {UsersService} from '../../services/users.service';
import {SpinnerService} from '../../services/spinner.service';

export interface DialogData {
  project: Projet;
  users: Utilisateur[];
  manager : Utilisateur;
  projectName : string;
  edited : boolean;
}
@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.scss']
})
export class ProjetComponent implements OnInit {
  public financements: Financement[] = [];
  public recettes: Recette[] = [];
  public montantsAffectes: MontantAffecte[] = [];
  public selectedFinancement: Financement;
  public selectedRecette: Recette;

  /**
   * id projet
   */
  public projectId: string;
  /**
   * projet
   */
  public projet: Projet;
  /**
   * /**
   * projet modifié
   */
  public projetToEdit: Projet;
  /**
   * Responsable du projet.
   */
  manager: Utilisateur;
  /**
   * La liste des utilisateur
   */
  managers: Utilisateur[];

  /**
   * Indique si le tableau est en lecture seule.
   */
  public get isReadOnly(): boolean {
    return !this.isAdministrator;
  }

  /**
   * Indique si l'utilisateur est un administrateur.
   */
  public get isAdministrator(): boolean {
    return !!this.adminSrv.isAdministrator();
  }

  /**
   *
   * @param adminSrv : permet de vérifier si l'utilisateur est un administrateur.
   * @param ProjetService : permet de dialoguer avec le serveur d'API pour les entités projet.
   * @param route
   * @param router
   * @param snackBar : affiche une information.
   */
  constructor(
    public readonly dialog: MatDialog,
    private readonly adminSrv: IsAdministratorGuardService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly _projetsService: ProjetsService,
    private readonly _projetService: ProjetService,
    private readonly _montantsAffectesService: MontantsAffectesService,
    private readonly _financementsService: FinancementsService,
    private spinnerSrv: SpinnerService,
    private usersSrv: UsersService,
  ) {
    this.projectId = this.route.snapshot.params.id;
    if (!this.projectId) {
      this.router.navigate(['home'])
    }
  }

  public async getRecettesFromFinancement(financement: Financement): Promise<void> {
    this.recettes = financement
      ? await this._projetService.getAllRecettesFromFinancement(financement)
      : [];
  }

  public async getMontantFromRecette(recette: Recette): Promise<void> {
    this.montantsAffectes = recette
      ? await this._montantsAffectesService.getAll(recette.id_r)
      : [];
  }

  public async getFinancementFromProjet(projet: Projet): Promise<void> {
    this.financements = await this._financementsService.getAll(projet.id_p);
  }

  public async onSelectFinancement(financement: Financement): Promise<void> {
    this.selectedFinancement = financement;
    await this.getRecettesFromFinancement(financement);
    if (this.recettes && this.recettes.length > 0)
      await this.getMontantFromRecette(this.recettes[0]);
    else
      this.montantsAffectes = [];
  }

  public onSelectRecette(recette: Recette): void {
    this.selectedRecette = recette;
    this.getMontantFromRecette(recette);
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.loadData(Number(this.projectId));
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Charge le projet depuis le serveur.
   */
  async loadData(projetId: number): Promise<Projet> {
    try {
      this.projet = await this._projetsService.get(projetId);
      this.projetToEdit = await this._projetsService.get(projetId);
      this.managers = await this.usersSrv.getAll(); // RG : tous les utilisateurs actifs peuvent être responsable projets
      // .filter(m => m.active_u);
      this.financements = await this._financementsService.getAll(this.projet.id_p);
      if (this.financements.length > 0) {
        this.recettes = await this._projetService.getAllRecettesFromFinancement(this.financements[0]);
        ;
      }
      if (this.recettes.length > 0) {
        this.montantsAffectes = await this._montantsAffectesService.getAll(this.recettes[0].id_r);
      }
      this.manager = this.projet.responsable;
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de charger le projet : ' + error.error);
      return Promise.reject(error);
    }
  }

  /**
   * Affiche une information.
   * @param message : message à afficher.
   */
  private showInformation(message: string): void {
    try {
      this.snackBar.open(
        message,
        'OK', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
    } catch (error) {
      console.error(error);
    }
  }

  public async updateProjectStatus(event: MatCheckboxChange): Promise<void> {
    this.projet.statut_p = event.checked;
    this.projet.id_u = this.projet.responsable.id_u;
    try {
      this.spinnerSrv.show();
      await this._projetsService.modify(this.projet);
      this.projet.responsable = this.manager;
      this.spinnerSrv.hide();
      if (this.projet.statut_p == true)
        this.showInformation("Le projet " + this.projet.nom_p + " est soldé ! ");
      if (this.projet.statut_p == false)
        this.showInformation("Le projet " + this.projet.nom_p + " est non soldé ! ");

    }

  catch(error) {
    console.error(error);
    for (const err of error.error.errors) {
      this.showInformation('Impossible de modifier le statut du projet : ' + err.message);
    }
  }


  }

  public openEditProjectDialog() : void {
    let projectName = this.projet.nom_p;
    let edited = false;
    const dialogRef = this.dialog.open(EditProjectDialogComponent, {
      width: '600px',
      data: {project : this.projetToEdit, users : this.managers, manager : this.manager , projectName : projectName ,edited :  edited},
    });

    dialogRef.afterClosed().subscribe(async result => {
      if(result)
      {
        if(result.edited) {
          console.log("result  : " , result);
          await this.updateProjectInfos(result.project);

          await this.refreshProject();
        }
      }
    });
  }

  /**
   * Met à jour les données d'affichage.
   */
  private async refreshProject() {

    try {
      this.projet = await this._projetsService.get(this.projet.id_p);
      this.manager=this.projet.responsable;

    } catch (error) {
      console.error(error);
    }
  }

  public async updateProjectInfos(editedProject : Projet): Promise<void> {
    editedProject.id_u = editedProject.responsable.id_u;
    try {
      this.spinnerSrv.show();
      await this._projetsService.modify(editedProject);
      this.spinnerSrv.hide();
      this.showInformation("Le projet a bien été modifé ! ");
      console.log("Update end");

    } catch (error) {
      console.error(error);
      for (const err of error.error.errors) {
        this.showInformation('Impossible de modifier le projet : ' + err.message);
      }

    }
  }


}


@Component({
  selector: 'edit-project-dialog',
  templateUrl: 'edit-project-popup.component.html',
  styleUrls: ['./projet.component.scss']
})
export class EditProjectDialogComponent {
  constructor(
    public dialogRef: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data : DialogData,) {
  }

  public managerId = this.data.manager.id_u;

  onNoClick(): void {
    this.dialogRef.closeAll()
  }

  async onYesClick(): Promise<void> {
    this.data.edited = true;
    this.data.project.responsable = this.data.users.find(responsable => responsable.id_u === this.managerId );
  }
}
