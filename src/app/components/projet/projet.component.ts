import { Component, OnInit } from '@angular/core';
import { Financement } from '../../models/financement';
import { Recette } from '../../models/recette';
import { IsAdministratorGuardService } from '../../services/authentication/is-administrator-guard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ProjetsService } from '../../services/projets.service';
import { Projet } from '../../models/projet';
import { MontantsAffectesService } from '../../services/montants-affectes.service';
import { MontantAffecte } from '../../models/montantAffecte';
import { FinancementsService } from '../../services/financements.service';
import { RecettesService } from '../../services/recettes.service';

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
    private readonly snackBar: MatSnackBar,
    private readonly projetsService: ProjetsService,
    private readonly recettesService: RecettesService,
    private readonly montantsAffectesService: MontantsAffectesService,
    private readonly financementsService: FinancementsService
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
      this.openSnackBar('Impossible de charger le projet : ' + error.error);
    }
  }

  public async loadData(projetId: number): Promise<Projet> {
    try {
      await this.loadProjetDetailsFromProjetId(projetId);
      await this.loadFinancementsFromProjetId(projetId);
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

  public onCreateRecette(recette: Recette): void {
    if (this.selectedRecette == null) {
      this.selectedRecette = recette;
      console.log('PROJET SELECTED RECETTE: ', this.selectedRecette);
    }
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
    this.financements = financements;
  }

  private openSnackBar(message: string): void {
    try {
      this.snackBar.open(message, 'OK', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    } catch (error) {
      console.error(error);
    }
  }

  private async loadProjetDetailsFromProjetId(projetId: number): Promise<void> {
    try {
      if (projetId) {
        this.projet = await this.projetsService.get(projetId);
      }
    } catch (error) {
      console.error(error);

      this.openSnackBar(error);
    }
  }

  private async loadFinancementsFromProjetId(projetId: number): Promise<void> {
    try {
      if (projetId) {
        this.financements = await this.financementsService.getAll(projetId);
      }
    } catch (error) {
      console.error(error);

      this.openSnackBar(error);
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

      this.openSnackBar(error);
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

      this.openSnackBar(error);
    }
  }
}
