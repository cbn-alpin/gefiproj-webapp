import { Component, OnInit } from '@angular/core';
import { Financement } from '../../models/financement';
import { Recette } from '../../models/recette';
import { IsAdministratorGuardService } from '../../services/authentication/is-administrator-guard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProjetsService } from '../../services/projets.service';
import { Projet } from '../../models/projet';
import { MontantsAffectesService } from '../../services/montants-affectes.service';
import { MontantAffecte } from '../../models/montantAffecte';
import { FinancementsService } from '../../services/financements.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Utilisateur } from '../../models/utilisateur';
import { SpinnerService } from '../../services/spinner.service';
import { RecettesService } from '../../services/recettes.service';
import { PopupService } from '../../shared/services/popup.service';

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

  /**
   * Responsable du projet.
   */
  manager: Utilisateur;

  public get isReadOnly(): boolean {
    return !this.isAdministrator;
  }

  public get isAdministrator(): boolean {
    return !!this.adminSrv.isAdministrator();
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
    private readonly spinnerSrv: SpinnerService
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
      await Promise.all([promiseDetails, promiseFinancement]);
      if (this.financements && this.financements.length > 0) {
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

  public onEditRecette(): void {
    if (!this.montantsAffectes && this.selectedRecette) {
      this.loadMontantsFromRecetteId(this.selectedRecette.id_r);
    }
  }

  public onRecettesChange(recettes: Recette[]): void {
    this.recettes = [...recettes];
  }

  public onFinancementsChange(financements: Financement[]): void {
    this.financements = [...financements];
  }

  private async loadProjetDetailsFromProjetId(projetId: number): Promise<void> {
    try {
      if (projetId) {
        this.projet = await this.projetsService.get(projetId);
      }
    } catch (error) {
      console.error(error);

      this.popupService.error(error);
    }
  }

  private async loadFinancementsFromProjetId(projetId: number): Promise<void> {
    try {
      if (projetId) {
        this.financements = await this.financementsService.getAll(projetId);
      }
      this.manager = this.projet.responsable;
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
        this.recettes = await this.recettesService.getAll(financementId);
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
      await this.projetsService.modify(this.projet);
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

  a() {
    console.log('SELECTED FINANCEMENT: ', this.selectedFinancement);
    console.log('SELECTED RECETTE: ', this.selectedRecette);
    console.log('FINANCEMENTS: ', this.financements);
    console.log('RECETTES: ', this.recettes);
    console.log('MONANTS AFFECTEES: ', this.montantsAffectes);
  }
}
