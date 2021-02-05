import { Component, Inject, OnInit } from '@angular/core';
import { Financement } from '../../models/financement';
import { Recette } from '../../models/recette';
import { IsAdministratorGuardService } from '../../services/authentication/is-administrator-guard.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ProjetsService } from '../../services/projets.service';
import { DefaultSortInfo, Projet, ProjetCallback } from '../../models/projet';
import { MontantsAffectesService } from '../../services/montants-affectes.service';
import { MontantAffecte } from '../../models/montantAffecte';
import { FinancementsService } from '../../services/financements.service';
import { Utilisateur } from '../../models/utilisateur';
import { SpinnerService } from '../../services/spinner.service';
import { RecettesService } from '../../services/recettes.service';
import { PopupService } from '../../shared/services/popup.service';
import { UsersService } from '../../services/users.service';
import { basicSort, getDeepCopy } from '../../shared/tools/utils';
import { AuthService } from '../../services/authentication/auth.service';
import { take } from 'rxjs/operators';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Messages } from '../../models/messages';

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

  public projetId: number;

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
   * Vrai si le projet est soldé
   */
  public isBalance: boolean;

  public isResponsable: boolean;

  public get isAdministrator(): boolean {
    return !!this.adminSrv.isAdministrator();
  }

  private selectedFinancementId: number;

  private selectedRecetteId: number;

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
    this.projetId = Number(this.route.snapshot.params.id);
    if (!this.projetId) {
      this.router.navigate(['home']);
    }
  }

  public async ngOnInit(): Promise<void> {
    try {
      await this.loadData(this.projetId);
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
      this.projetToEdit = getDeepCopy(this.projet);
      this.manager = this.projet.responsable;
      if (this.financements && this.financements.length > 0) {
        this.selectedFinancement = this.financements[0];
        this.selectedFinancementId = this.financements[0].id_f;
        await this.loadRecettesFromFinancementId(this.selectedFinancement.id_f);
        if (this.recettes && this.recettes.length > 0) {
          this.selectedRecette = this.recettes[0];
          this.selectedRecetteId = this.recettes[0].id_r;
          await this.loadMontantsFromRecetteId(this.selectedRecette.id_r);
        }
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async onSelectFinancement(financement: Financement): Promise<void> {
    this.selectedFinancement = financement;
    this.selectedFinancementId = financement.id_f;
    await this.loadRecettesFromFinancementId(financement.id_f);
    if (this.recettes && this.recettes.length > 0) {
      this.selectedRecette = this.recettes[0];
      this.selectedRecetteId = this.recettes[0].id_r;
      this.loadMontantsFromRecetteId(this.selectedRecette.id_r);
    } else {
      this.selectedRecette = null;
      this.selectedRecetteId = null;
      this.montantsAffectes = null;
    }
  }

  public onSelectRecette(recette: Recette): void {
    this.selectedRecette = recette;
    this.selectedRecetteId = recette.id_r;
    this.loadMontantsFromRecetteId(recette.id_r);
  }

  public onDeleteFinancement(projetCallback: ProjetCallback): void {
    if (this.selectedFinancementId === projetCallback.id) {
      this.selectedFinancement = null;
      this.selectedFinancementId = null;
      this.selectedRecette = null;
      this.selectedRecetteId = null;
      this.recettes = null;
      this.montantsAffectes = null;
    }
    this.refreshFinancements(projetCallback);
  }

  public onDeleteRecette(projetCallback: ProjetCallback): void {
    if (this.selectedRecetteId === projetCallback.id) {
      this.selectedRecette = null;
      this.selectedRecetteId = null;
      this.montantsAffectes = null;
    }
    this.refreshRecettes(projetCallback);
  }

  public onDeleteMontantAffecte(projetCallback: ProjetCallback): void {
    this.refreshMontantsAffectes(projetCallback);
  }

  public onCreateFinancement(projetCallback: ProjetCallback): void {
    this.selectedFinancementId = projetCallback.id;
    this.recettes = [];
    this.montantsAffectes = null;
    this.selectedRecette = null;
    this.selectedRecetteId = null;
    this.refreshFinancements(projetCallback);
  }

  public onCreateRecette(projetCallback: ProjetCallback): void {
    this.selectedRecetteId = projetCallback.id;
    this.montantsAffectes = [];
    this.refreshRecettes(projetCallback);
  }

  public onCreateMontantAffecte(projetCallback: ProjetCallback): void {
    this.refreshMontantsAffectes(projetCallback);
  }

  public onEditFinancement(projetCallback: ProjetCallback): void {
    this.refreshFinancements(projetCallback);
  }

  public onEditRecette(projetCallback: ProjetCallback): void {
    this.refreshRecettes(projetCallback);
  }

  public onEditMontantAffecte(projetCallback: ProjetCallback): void {
    this.refreshMontantsAffectes(projetCallback);
  }

  public async refreshFinancements(
    projetCallback: ProjetCallback
  ): Promise<void> {
    await this.loadFinancementsFromProjetId(this.projet.id_p);
    projetCallback?.cb(); // -> Passer la ligne du tableau en mode lecture
    if (projetCallback?.message) {
      this.popupService.success(projetCallback.message);
    }
  }

  public async refreshRecettes(projetCallback: ProjetCallback): Promise<void> {
    await this.loadFinancementsFromProjetId(this.projet.id_p);
    await this.loadRecettesFromFinancementId(this.selectedFinancement.id_f);
    projetCallback?.cb(); // -> Passer la ligne du tableau en mode lecture
    if (projetCallback?.message) {
      this.popupService.success(projetCallback.message);
    }
  }

  public async refreshMontantsAffectes(
    projetCallback: ProjetCallback
  ): Promise<void> {
    await this.loadRecettesFromFinancementId(this.selectedFinancement.id_f);
    await this.loadMontantsFromRecetteId(this.selectedRecette.id_r);
    projetCallback?.cb(); // -> Passer la ligne du tableau en mode lecture
    if (projetCallback?.message) {
      this.popupService.success(projetCallback.message);
    }
  }

  public displayProjet(): boolean {
    return (
      this.projet &&
      this.manager &&
      this.isAdministrator != null &&
      this.isResponsable != null
    );
  }

  private async loadProjetDetailsFromProjetId(projetId: number): Promise<void> {
    try {
      if (projetId) {
        this.projet = await this.projetsService.get(projetId);
        this.checkIfUserHasResponsableRight(this.projet);
        this.checkIfProjetIsBalance(this.projet);
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
        this.selectedFinancement = this.financements.find(
          (financement) => financement.id_f === this.selectedFinancementId
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
        this.selectedRecette = this.recettes.find(
          (recette) => recette.id_r === this.selectedRecetteId
        );
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

  private checkIfUserHasResponsableRight(projet: Projet): void {
    this.isResponsable =
      this.authService.userAuth.id_u ===
      (projet.responsable ? projet.responsable.id_u : projet.id_u);
  }

  private checkIfProjetIsBalance(projet: Projet): void {
    this.isBalance = projet.statut_p;
  }

  // debug() {
  //   console.log('FINANCEMENTS: ', this.financements);
  //   console.log('RECETTES: ', this.recettes);
  //   console.log('MONTANTS: ', this.montantsAffectes);
  //   console.log('SELECTED FINANCEMENTS: ', this.selectedFinancement);
  //   console.log('SELECTED FINANCEMENTS ID: ', this.selectedFinancementId);
  //   console.log('SELECTED RECETTES: ', this.selectedRecette);
  //   console.log('SELECTED RECETTES ID: ', this.selectedRecetteId);
  // }

  //**
  // Gestion détails projet
  //**

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
      .subscribe(async (object) => {
        const result = object.data;
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
      this.projetToEdit = getDeepCopy(this.projet);
      this.checkIfProjetIsBalance(this.projet);
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
}

@Component({
  selector: 'edit-project-dialog',
  templateUrl: 'edit-project-popup.component.html',
  styleUrls: ['./projet.component.scss'],
})
export class EditProjectDialogComponent implements OnInit {
  public formGroup: FormGroup;
  public errorStateMatcher1: ErrorStateMatcher;
  public errorStateMatcher2: ErrorStateMatcher;

  public get min(): number {
    const date = new Date(Date.now());
    const year = date.getFullYear() % 100;
    return Math.max(20, year - 10); // Démarrage en 2020
  }
  public get max(): number {
    const date = new Date(Date.now());
    return (date.getFullYear() % 100) + 10;
  }

  private readonly patternCode = '^\\d{5}$';

  constructor(
    public dialogRef: MatDialogRef<EditProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private readonly fb: FormBuilder,
    private readonly projetsService: ProjetsService,
    private readonly popupService: PopupService
  ) {}

  ngOnInit() {
    this.formGroup = this.fb.group({
      nom: [
        {
          value: this.data.project.nom_p,
          disabled: this.data.project.statut_p,
        },
        [Validators.required],
      ],
      code: [
        {
          value: this.data.project.code_p,
          disabled: this.data.project.statut_p,
        },
        [Validators.required, Validators.pattern(new RegExp(this.patternCode))],
      ],
      status: [this.data.project.statut_p, [Validators.required]],
    });
    this.errorStateMatcher1 = new MyCustomErrorStateMatcher();
    this.errorStateMatcher2 = new MyCustomErrorStateMatcher();
  }

  public managerId = this.data.manager.id_u;

  onNoClick(): void {
    this.dialogRef.close();
  }

  async onYesClick(): Promise<void> {
    this.data.project = {
      ...this.data.project,
      nom_p: this.formGroup.get('nom').value,
      code_p: Number(this.formGroup.get('code').value),
      statut_p: this.formGroup.get('status').value,
    };
    this.data.edited = true;
    this.data.project.responsable = this.data.users.find(
      (responsable) => responsable.id_u === this.managerId
    );
    if (!this.isBalance() && this.hasInvalidProjectCode(this.data.project)) {
      this.formGroup.get('code').setErrors({ range: true });
      this.popupService.error(Messages.ERROR_FORM);
    } else if (
      !this.isBalance() &&
      (await this.hasDuplicateProjectCode(this.data.project))
    ) {
      this.formGroup.get('code').setErrors({ duplicate: true });
      this.popupService.error(Messages.ERROR_FORM);
    } else {
      this.dialogRef.close({ data: this.data });
    }
  }

  private async hasDuplicateProjectCode(projet: Projet): Promise<boolean> {
    try {
      const projets = await this.getProjets();
      const projectCodes = projets.map((project) => project.code_p);
      const tempArray =
        projets.find(
          (_projet) =>
            _projet.id_p === projet.id_p && _projet.code_p === projet.code_p
        ) != null
          ? projectCodes
          : projectCodes.concat(projet.code_p);
      return tempArray.some(
        (element, index) => tempArray.indexOf(element) !== index
      );
    } catch (e) {
      console.error(e);
    }
  }

  private async getProjets(): Promise<Projet[]> {
    try {
      return await this.projetsService.getAll();
    } catch (e) {
      console.error(e);
    }
  }

  private hasInvalidProjectCode(projet: Projet): boolean {
    const codeVal = projet.code_p || 0;
    return codeVal / 1000 < this.min || Math.floor(codeVal / 1000) > this.max;
  }

  public isBalance(): boolean {
    return (
      this.formGroup.get('nom').disabled && this.formGroup.get('code').disabled
    );
  }
}

/** Error when invalid control -> affiche immédiatement s'il y a une erreur dans l'input */
export class MyCustomErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return !!(control && control.invalid);
  }
}
