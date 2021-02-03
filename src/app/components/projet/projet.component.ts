import { Component, Inject, OnInit } from '@angular/core';
import { Financement } from '../../models/financement';
import { Recette } from '../../models/recette';
import { IsAdministratorGuardService } from '../../services/authentication/is-administrator-guard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ProjetsService } from '../../services/projets.service';
import { DefaultSortInfo, Projet } from '../../models/projet';
import { MontantsAffectesService } from '../../services/montants-affectes.service';
import { MontantAffecte } from '../../models/montantAffecte';
import { FinancementsService } from '../../services/financements.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Utilisateur } from '../../models/utilisateur';
import { SpinnerService } from '../../services/spinner.service';
import { RecettesService } from '../../services/recettes.service';
import { PopupService } from '../../shared/services/popup.service';
import { UsersService } from '../../services/users.service';
import { basicSort, getDeepCopy } from '../../shared/tools/utils';
import { AuthService } from '../../services/authentication/auth.service';
import { take } from 'rxjs/operators';

export interface DialogData {
  project: Projet;
  users: Utilisateur[];
  manager: Utilisateur;
  projectName: string;
  edited: boolean;
}

@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.scss'],
})
export class ProjetComponent implements OnInit {
  public financements: Financement[];

  public recettes: Recette[];

  public montantsAffectes: MontantAffecte[];

  public selectedFinancement: Financement;

  public selectedRecette: Recette;

  public projetId: string;

  public projet: Projet;

  public financementsDefaultSortInfo: DefaultSortInfo = {
    sortInfo: {
      name: 'montant_arrete_f',
      direction: 'asc',
    },
    headerName: 'Montant Arreté',
  };

  public recettesDefaultSortInfo: DefaultSortInfo = {
    sortInfo: {
      name: 'annee_r',
      direction: 'asc',
    },
    headerName: 'Année recette',
  };

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
   * Vrai si le projet n'est pas soldé et que l'utilisateur est une administrateur
   */
  public canEditDetails: boolean;

  /**
   * Vrai si le projet est soldé
   */
  public isBalance: boolean;

  public isResponsable: boolean;

  public get isAdministrator(): boolean {
    return false;
  }

  constructor(
    public readonly dialog: MatDialog,
    private readonly adminSrv: IsAdministratorGuardService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly popupService: PopupService,
    private readonly projetsService: ProjetsService,
    private readonly recettesService: RecettesService,
    private readonly montantsAffectesService: MontantsAffectesService,
    private readonly financementsService: FinancementsService,
    private readonly spinnerSrv: SpinnerService,
    private readonly usersSrv: UsersService,
    private readonly authService: AuthService
  ) {
    this.projetId = this.route.snapshot.params.id;
    if (!this.projetId) {
      this.router.navigate(['home']);
    }
  }

  public async ngOnInit(): Promise<void> {
    try {
      await this.loadData(Number(this.projetId));
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de charger le projet : ' + error.error
      );
    }
  }

  public async loadData(projetId: number): Promise<Projet> {
    try {
      const promiseDetails = this.loadProjetDetailsFromProjetId(projetId);
      const promiseFinancement = this.loadFinancementsFromProjetId(projetId);
      const promiseUtilisateurs = this.loadAllUsers(projetId);
      await Promise.all([
        promiseDetails,
        promiseFinancement,
        promiseUtilisateurs,
      ]);
      if (this.financements && this.financements.length > 0) {
        this.projetToEdit = getDeepCopy(this.projet);
        this.manager = this.projet.responsable;
        this.selectedFinancement = this.financements[0];
        await this.loadRecettesFromFinancementId(this.selectedFinancement.id_f);
        if (this.recettes && this.recettes.length > 0) {
          this.selectedRecette = this.recettes[0];
          await this.loadMontantsFromRecetteId(this.selectedRecette.id_r);
        }
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async onSelectFinancement(financement: Financement): Promise<void> {
    this.selectedFinancement = financement;
    await this.loadRecettesFromFinancementId(financement.id_f);
    if (this.recettes && this.recettes.length > 0) {
      this.selectedRecette = this.recettes[0];
      this.loadMontantsFromRecetteId(this.selectedRecette.id_r);
    } else {
      this.montantsAffectes = null;
    }
  }

  public onSelectRecette(recette: Recette): void {
    this.loadMontantsFromRecetteId(recette.id_r);
  }

  public onCreateFinancement(): void {
    if (!this.recettes) {
      this.recettes = [];
    }
    if (this.financements.length === 1) {
      this.selectedFinancement = this.financements[0];
    }
  }

  public onEditFinancement(): void {
    if (!this.recettes) {
      this.recettes = [];
    }
  }

  public onDeleteFinancement(): void {
    if (!this.selectedFinancement && this.recettes) {
      this.recettes = null;
      this.montantsAffectes = null;
    }
  }

  public onDeleteRecette(): void {
    if (!this.selectedRecette && this.montantsAffectes) {
      this.montantsAffectes = null;
    }
  }

  public onSelectedRecetteChange(recette: Recette): void {
    this.selectedRecette = recette;
    if (this.selectedRecette == null) {
      this.montantsAffectes = null;
    }
  }

  public onSelectedFinancementChange(financement: Financement): void {
    this.selectedFinancement = financement;
    if (this.selectedFinancement == null) {
      this.recettes = null;
      this.montantsAffectes = null;
    }
  }

  public onCreateRecette(recette: Recette): void {
    if (!this.montantsAffectes) {
      this.montantsAffectes = [];
    }
  }

  public onEditRecette(): void {}

  public onFinancementsChange(financements: Financement[]): void {
    this.financements = [...financements];
  }

  public onRecettesChange(recettes: Recette[]): void {
    this.recettes = [...recettes];
    // Calcule de la différence pour le financement sélectionné
    const sumRecettes = this.recettes.reduce((a, b) => a + b.montant_r, 0);
    this.selectedFinancement.difference =
      this.selectedFinancement.montant_arrete_f - sumRecettes;
  }

  public onMontantsAffectesChange(montantAffectes: MontantAffecte[]): void {
    this.montantsAffectes = [...montantAffectes];
    // Calcule de la différence pour la recette sélectionné
    const sumMontants = this.montantsAffectes.reduce(
      (a, b) => a + b.montant_ma,
      0
    );
    this.selectedRecette.difference =
      this.selectedRecette.montant_r - sumMontants;
  }

  public displayProjet(): boolean {
    return (
      this.projet &&
      this.manager &&
      this.isAdministrator != null &&
      this.canEditDetails != null &&
      this.isResponsable != null
    );
  }

  private async loadProjetDetailsFromProjetId(projetId: number): Promise<void> {
    try {
      if (projetId) {
        this.projet = await this.projetsService.get(projetId);
        this.checkIfUserHasResponsableRight(this.projet);
        this.checkIfProjetIsBalance(this.projet);
        this.checkIfUserCanEditProjetDetails();
      }
    } catch (error) {
      console.error(error);

      this.popupService.error(error);
    }
  }

  private async loadAllUsers(projetId: number): Promise<void> {
    try {
      if (projetId) {
        this.managers = await this.usersSrv.getAll();
      }
    } catch (error) {
      console.error(error);

      this.popupService.error(error);
    }
  }

  private async loadFinancementsFromProjetId(projetId: number): Promise<void> {
    try {
      if (projetId) {
        const financements = await this.financementsService.getAll(projetId);
        this.financements = basicSort(
          financements,
          this.financementsDefaultSortInfo.sortInfo
        );
      }
    } catch (error) {
      console.error(error);

      this.popupService.error(error);
    }
  }

  private async loadRecettesFromFinancementId(
    financementId: number
  ): Promise<void> {
    try {
      if (financementId) {
        const recettes = await this.recettesService.getAll(financementId);
        this.recettes = basicSort(
          recettes,
          this.recettesDefaultSortInfo.sortInfo
        );
        // TODO:
        // Dans le back, si une recette n'a pas de financement alors sa difference = null
        // Il faut mieux set la difference = montant recette dans ce cas
        this.recettes.forEach((recette) => {
          if (recette.difference == null) {
            recette.difference = recette.montant_r;
          }
        });
      }
    } catch (error) {
      console.error(error);

      this.popupService.error(error);
    }
  }

  private async loadMontantsFromRecetteId(recetteId: number): Promise<void> {
    try {
      if (recetteId) {
        this.montantsAffectes = await this.montantsAffectesService.getAll(
          recetteId
        );
      }
    } catch (error) {
      console.error(error);

      this.popupService.error(error);
    }
  }
  public async updateProjectStatus(event: MatCheckboxChange): Promise<void> {
    this.projet.statut_p = event.checked;
    this.projet.id_u = this.projet.responsable.id_u;
    try {
      this.spinnerSrv.show();
      const updatedProjet = await this.projetsService.modify(this.projet);
      this.projet.statut_p = updatedProjet.statut_p;
      this.projetToEdit = getDeepCopy(this.projet);
      this.checkIfProjetIsBalance(this.projet);
      this.checkIfUserCanEditProjetDetails();
      this.projet.responsable = this.manager;
      this.spinnerSrv.hide();
      if (this.projet.statut_p == true)
        this.popupService.success(
          'Le projet ' + this.projet.nom_p + ' est soldé ! '
        );

      if (this.projet.statut_p == false)
        this.popupService.success(
          'Le projet ' + this.projet.nom_p + ' est non soldé ! '
        );
    } catch (error) {
      console.error(error);
      for (const err of error.error.errors) {
        this.popupService.error(
          'Impossible de créer le montant affecté : ' + err.message
        );
      }
    }
  }

  public openEditProjectDialog(): void {
    let projectName = this.projet.nom_p;
    let edited = false;
    const dialogRef = this.dialog.open(EditProjectDialogComponent, {
      width: '600px',
      data: {
        project: this.projetToEdit,
        users: this.managers,
        manager: this.manager,
        projectName: projectName,
        edited: edited,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(async (result) => {
        if (result) {
          if (result.edited) {
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
      this.projet = await this.projetsService.get(this.projet.id_p);
      this.manager = this.projet.responsable;
    } catch (error) {
      console.error(error);
    }
  }

  public async updateProjectInfos(editedProject: Projet): Promise<void> {
    editedProject.id_u = editedProject.responsable.id_u;
    try {
      this.spinnerSrv.show();
      await this.projetsService.modify(editedProject);
      this.checkIfUserHasResponsableRight(editedProject);
      this.spinnerSrv.hide();
      this.popupService.success('Le projet a bien été modifié ! ');
    } catch (error) {
      console.error(error);
      for (const err of error.error.errors) {
        this.popupService.error(
          'Impossible de modifier le projet : ' + err.message
        );
      }
    }
  }

  private checkIfUserHasResponsableRight(projet: Projet): void {
    this.isResponsable =
      this.authService.userAuth.id_u ===
      (projet.responsable ? projet.responsable.id_u : projet.id_u);
  }

  private checkIfProjetIsBalance(projet: Projet): void {
    this.isBalance = projet.statut_p;
  }

  private checkIfUserCanEditProjetDetails(): void {
    this.canEditDetails = this.isAdministrator && this.isBalance === false;
  }

  // debug() {
  //   console.log('FINANCEMENTS: ', this.financements);
  //   console.log('RECETTES: ', this.recettes);
  //   console.log('MONTANTS: ', this.montantsAffectes);
  //   console.log('SELECTED FINANCEMENTS: ', this.selectedFinancement);
  //   console.log('SELECTED RECETTES: ', this.selectedRecette);
  // }
}

@Component({
  selector: 'edit-project-dialog',
  templateUrl: 'edit-project-popup.component.html',
  styleUrls: ['./projet.component.scss'],
})
export class EditProjectDialogComponent {
  constructor(
    public dialogRef: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  public managerId = this.data.manager.id_u;

  onNoClick(): void {
    this.dialogRef.closeAll();
  }

  async onYesClick(): Promise<void> {
    this.data.edited = true;
    this.data.project.responsable = this.data.users.find(
      (responsable) => responsable.id_u === this.managerId
    );
  }
}
