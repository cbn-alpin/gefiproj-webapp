import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import {
  MatDialog,
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { Financement } from '../../models/financement';
import { Messages } from '../../models/messages';
import { MontantAffecte } from '../../models/montantAffecte';
import { DefaultSortInfo, Projet, ProjetCallback } from '../../models/projet';
import { Recette } from '../../models/recette';
import { Utilisateur } from '../../models/utilisateur';
import { AmountsService } from '../../services/amounts.service';
import { AuthService } from '../../services/authentication/auth.service';
import { IsAdministratorGuardService } from '../../services/authentication/is-administrator-guard.service';
import { FundingsService } from '../../services/fundings.service';
import { ProjectsService } from '../../services/projects.service';
import { ReceiptsService } from '../../services/receipts.service';
import { UsersService } from '../../services/users.service';
import { PopupService } from '../../shared/services/popup.service';
import { basicSort, getDeepCopy } from '../../shared/tools/utils';

export interface DialogData {
  project: Projet;
  users: Utilisateur[];
  manager: Utilisateur;
  projectName: string;
  edited: boolean;
}

/**
 * Affiche les détails d'un projet.
 */
@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.scss'],
})
export class ProjetComponent implements OnInit {
  /**
   * La liste des finacement liés au projet.
   */
  public financements: Financement[];

  /**
   * La liste des recettes liées aux financements liés au projet.
   */
  public recettes: Recette[];

  /**
   * La liste des montants affectés liés aux recettes liées aux financements liés au projet.
   */
  public montantsAffectes: MontantAffecte[];

  /**
   * Le financement selectionné.
   */
  public selectedFinancement: Financement;

  /**
   * La recette selectionnée.
   */
  public selectedRecette: Recette;

  /**
   * L'id du projet.
   */
  public projetId: number;

  /**
   * Le projet.
   */
  public projet: Projet;

  /**
   * Le tri par défaut de la liste des financements.
   */
  public financementsDefaultSortInfo: DefaultSortInfo;

  /**
   * Le tri par défaut de la liste des recettes.
   */
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

  /**
   * Indique si l'utilisateur connecté est le responsable du projet.
   */
  public isResponsable: boolean;

  /**
   * Indique si le bouton d'édition du projet est désactivé ou pas.
   */
  public disableEditProjetButton = false;

  /**
   * Indique si l'utilisateur connecté est admin ou pas.
   */
  public get isAdministrator(): boolean {
    return !!this.adminSrv.isAdministrator();
  }

  /**
   * L'id du financement selectionné.
   * @private
   */
  private selectedFinancementId: number;

  /**
   * L'id de la recette selectionnée.
   * @private
   */
  private selectedRecetteId: number;

  /**
   * Affiche le détails d'un projet.
   * @param adminSrv : permet de vérifier si l'utilisateur est un administrateur.
   * @param projetsService : permet de charger les projets.
   * @param recettesService : permet de charger les recettes.
   * @param financementsService : permet de charger les financements.
   * @param amountsService : permet de charger les montants affectés.
   * @param usersSrv : permet de charger les utilisateurs.
   * @param route : permet la navigation.
   * @param authService : permet de vérifier les données de l'utilisateur connecté.
   * @param router : permet la navigation.
   * @param popupService : affiche une information.
   * @param dialog : affiche une boîte de dialogue.
   */
  constructor(
    public readonly dialog: MatDialog,
    private readonly adminSrv: IsAdministratorGuardService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly popupService: PopupService,
    private readonly projetsService: ProjectsService,
    private readonly recettesService: ReceiptsService,
    private readonly amountsService: AmountsService,
    private readonly financementsService: FundingsService,
    private readonly usersSrv: UsersService,
    private readonly authService: AuthService
  ) {
    this.projetId = Number(this.route.snapshot.params.id);
    if (!this.projetId) {
      this.router.navigate(['home']);
    }
  }

  /**
   * Initialise le composant.
   */
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

  /**
   * Charge les détails du projet selon son id.
   * Charge les financements du projet.
   * Charge les recette du financement selectionné par défaut.
   * Charge les montants affectés de la recettes selectionnée par défaut.
   * @param projetId : l'id du projet
   */
  public async loadData(projetId: number): Promise<Projet> {
    try {
      const promiseDetails = this.loadProjetDetailsFromProjetId(projetId);
      const promiseFinancement = this.loadFinancementsFromProjetId(projetId);
      await Promise.all([promiseDetails, promiseFinancement]);
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

  /**
   * Gére le chargement des données lors de la sélection d'un financement.
   * @param financement : financement selectionné.
   */
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

  /**
   * Gére le chargement des données lors de la sélection d'une recette.
   * @param recette : recette selectionnée.
   */
  public onSelectRecette(recette: Recette): void {
    this.selectedRecette = recette;
    this.selectedRecetteId = recette.id_r;
    this.loadMontantsFromRecetteId(recette.id_r);
  }

  /**
   * Un financements a été supprimé du tableau.
   * @param projetCallback : encapsule le financement à supprimer.
   */
  public onDeleteFinancement(projetCallback: ProjetCallback): void {
    if (this.selectedFinancementId === projetCallback.id) {
      const index = this.financements.findIndex(
        (financement) => financement.id_f === this.selectedFinancementId
      );
      let nextIndex: number;
      if (index !== -1 && index < this.financements.length - 1) {
        nextIndex = index + 1;
      }
      this.selectedFinancementId =
        nextIndex != null ? this.financements[nextIndex]?.id_f : null;
      this.selectedRecette = null;
      this.selectedRecetteId = null;
      this.recettes = null;
      this.montantsAffectes = null;
    }

    this.refreshFinancements(projetCallback);
  }

  /**
   * Une recette a été supprimé du tableau.
   * @param projetCallback : encapsule lea recette à supprimer.
   */
  public onDeleteRecette(projetCallback: ProjetCallback): void {
    if (this.selectedRecetteId === projetCallback.id) {
      const index = this.recettes.findIndex(
        (recette) => recette.id_r === this.selectedRecetteId
      );
      let nextIndex: number;
      if (index !== -1 && index < this.recettes.length - 1) {
        nextIndex = index + 1;
      }
      this.selectedRecetteId = nextIndex
        ? this.recettes[nextIndex]?.id_r
        : null;
      this.montantsAffectes = null;
    }
    this.refreshRecettes(projetCallback);
  }

  /**
   * Un montant affecté a été supprimé du tableau.
   * @param projetCallback : encapsule le montant affecté à supprimer.
   */
  public onDeleteMontantAffecte(projetCallback: ProjetCallback): void {
    this.refreshMontantsAffectes(projetCallback);
  }

  /**
   * Un financements a été ajouté au tableau.
   * @param projetCallback : encapsule le financement à ajouter.
   */
  public onCreateFinancement(projetCallback: ProjetCallback): void {
    this.selectedFinancementId = projetCallback.id;
    this.recettes = [];
    this.montantsAffectes = null;
    this.selectedRecette = null;
    this.selectedRecetteId = null;
    this.refreshFinancements(projetCallback);
  }

  /**
   * Une recette a été ajoutée au tableau.
   * @param projetCallback : encapsule la recette à ajouter.
   */
  public onCreateRecette(projetCallback: ProjetCallback): void {
    this.selectedRecetteId = projetCallback.id;
    this.montantsAffectes = [];
    this.refreshRecettes(projetCallback);
  }

  /**
   * Un montant affecté a été ajoutée au tableau.
   * @param projetCallback : encapsule le montant affecté à ajouter.
   */
  public onCreateMontantAffecte(projetCallback: ProjetCallback): void {
    this.refreshMontantsAffectes(projetCallback);
  }

  /**
   * Un financement a été modifié.
   * @param projetCallback : encapsule le financement à modifiér.
   */
  public onEditFinancement(projetCallback: ProjetCallback): void {
    this.refreshFinancements(projetCallback);
  }

  /**
   * Une recette a été modifiée.
   * @param projetCallback : encapsule la recette à modifiér.
   */
  public onEditRecette(projetCallback: ProjetCallback): void {
    this.refreshRecettes(projetCallback);
  }

  /**
   * Un montant affecté a été modifié.
   * @param projetCallback : encapsule le montant affecté à modifiér.
   */
  public onEditMontantAffecte(projetCallback: ProjetCallback): void {
    this.refreshMontantsAffectes(projetCallback);
  }

  /**
   * Raffraichit le tableau des financements.
   * @param projetCallback
   */
  public async refreshFinancements(
    projetCallback: ProjetCallback
  ): Promise<void> {
    await this.refreshAll();
    projetCallback?.cb(); // -> Valide la modification de la ligne du tableau
    if (projetCallback?.message) {
      this.popupService.success(projetCallback.message);
    }
  }

  /**
   * Raffraichit le tableau des recettes.
   * @param projetCallback
   */
  public async refreshRecettes(projetCallback: ProjetCallback): Promise<void> {
    await this.refreshAll();
    projetCallback?.cb(); // -> Valide la modification de la ligne du tableau
    if (projetCallback?.message) {
      this.popupService.success(projetCallback.message);
    }
  }

  /**
   * Raffraichit le tableau des montants affectés.
   * @param projetCallback
   */
  public async refreshMontantsAffectes(
    projetCallback: ProjetCallback
  ): Promise<void> {
    await this.refreshAll();
    projetCallback?.cb(); // -> Valide la modification de la ligne du tableau
    if (projetCallback?.message) {
      this.popupService.success(projetCallback.message);
    }
  }

  /**
   * Raffraichit tout les tableaux.
   * @param projetCallback
   */
  public async refreshAll(): Promise<void> {
    await this.loadFinancementsFromProjetId(this.projet.id_p);
    if (this.selectedFinancement?.id_f) {
      // Le financement id match avec les nouveaux financements => on le sélectionne
      await this.loadRecettesFromFinancementId(this.selectedFinancement?.id_f);
    } else if (this.financements?.length) {
      // Le financement id  ne match pas avec les nouveaux financements => on sélectionne le 1er
      this.selectedFinancementId = this.financements[0]?.id_f;
      this.selectedFinancement = this.financements[0];
      await this.loadRecettesFromFinancementId(this.selectedFinancementId);
    } else {
      // Les financements sont vides => on met tout à null
      this.selectedFinancementId = null;
      this.selectedFinancement = null;
      this.selectedRecetteId = null;
      this.selectedRecette = null;
      this.recettes = null;
    }

    if (this.selectedFinancement) {
      if (this.selectedRecette?.id_r) {
        // La recette id match avec les nouvelles recettes => on la sélectionne
        await this.loadMontantsFromRecetteId(this.selectedRecette?.id_r);
      } else if (this.recettes?.length) {
        // La recette id ne match pas avec les nouvelles recettes => on sélectionne la 1ère
        this.selectedRecetteId = this.recettes[0]?.id_r;
        this.selectedRecette = this.recettes[0];
        await this.loadMontantsFromRecetteId(this.selectedRecetteId);
      } else {
        // Les recettes sont vides => on met tout à null
        this.selectedRecetteId = null;
        this.selectedRecette = null;
        this.montantsAffectes = null;
      }
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

  /**
   * Charge les données du projet depuis le serveur.
   * @param projetId : l'id du projet à charger.
   * @private
   */
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

  /**
   * Charge tout les utilisateurs depuis le serveur.
   * @param projetId : l'id du projet.
   * @private
   */
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

  /**
   * Charge les financements d'un projet.
   * @param projetId : l'id du projet.
   * @private
   */
  private async loadFinancementsFromProjetId(projetId: number): Promise<void> {
    try {
      if (projetId) {
        const financements = await this.financementsService.getAll(projetId);
        this.financements = basicSort(
          financements,
          this.financementsDefaultSortInfo?.sortInfo
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

  /**
   * Charge les recettes d'un financement.
   * @param financementId : l'id du financement.
   * @private
   */
  private async loadRecettesFromFinancementId(
    financementId: number
  ): Promise<void> {
    try {
      if (financementId) {
        const recettes = await this.recettesService.getAllFromFunding(financementId);
        this.recettes = basicSort(
          recettes,
          this.recettesDefaultSortInfo?.sortInfo
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

  /**
   * Charge les montants affectés d'une recette.
   * @param recetteId : l'id de la recette.
   * @private
   */
  private async loadMontantsFromRecetteId(recetteId: number): Promise<void> {
    try {
      if (recetteId) {
        this.montantsAffectes = await this.amountsService.getAll(
          recetteId
        );
      }
    } catch (error) {
      console.error(error);

      this.popupService.error(error);
    }
  }

  /**
   * Vérifier si l'utilisateur connecté est le responsable du projet.
   * @param projet ; le projet concerné.
   * @private
   */
  private checkIfUserHasResponsableRight(projet: Projet): void {
    this.isResponsable =
      this.authService.userAuth.id_u ===
      (projet.responsable ? projet.responsable.id_u : projet.id_u);
  }

  /**
   * Vérifier si le projet est soldé ou pas.
   * @param projet : le projet concerné.
   * @private
   */
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

  /**
   * Détecte le début d'une action sur le tableau générique.
   */
  public onStartAction(): void {
    this.disableEditProjetButton = true;
  }

  /**
   * Détecte la fin d'une action sur le tableau générique.
   */
  public onEndAction(): void {
    this.disableEditProjetButton = false;
  }

  /**
   * Gère la popup de l'édition d'un projet
   */
  public async openEditProjectDialog(): Promise<void> {
    const projectName = this.projet.nom_p;
    const edited = false;
    await this.loadAllUsers(this.projetToEdit.id_p);
    const dialogRef = this.dialog.open(EditProjectDialogComponent, {
      width: '600px',
      data: {
        project: this.projetToEdit,
        users: this.managers,
        manager: this.manager,
        projectName,
        edited,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(async (object) => {
        const result = object?.data;
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
  private async refreshProject(): Promise<void> {
    try {
      this.projet = await this.projetsService.get(this.projet.id_p);
      this.manager = this.projet.responsable;
      this.projetToEdit = getDeepCopy(this.projet);
      this.checkIfProjetIsBalance(this.projet);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Envoie le projet modifié au serveur.
   * @param editedProject : le projet à modifié.
   */
  public async updateProjectInfos(editedProject: Projet): Promise<void> {
    editedProject.id_u = editedProject.responsable.id_u;
    try {
      await this.projetsService.modify(editedProject);
      this.checkIfUserHasResponsableRight(editedProject);
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
  // tslint:disable-next-line: component-selector
  selector: 'edit-project-dialog',
  templateUrl: 'edit-project-popup.component.html',
  styleUrls: ['./projet.component.scss'],
})
export class EditProjectDialogComponent implements OnInit {

  public get min(): number {
    const date = new Date(Date.now());
    const year = date.getFullYear() % 100;
    return Math.max(10, year - 10); // Démarrage en 2010
  }
  public get max(): number {
    const date = new Date(Date.now());
    return (date.getFullYear() % 100) + 10;
  }

  constructor(
    public dialogRef: MatDialogRef<EditProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private readonly fb: FormBuilder,
    private readonly projectsService: ProjectsService,
    private readonly popupService: PopupService
  ) {}
  public formGroup: FormGroup;
  public errorStateMatcher1: ErrorStateMatcher;
  public errorStateMatcher2: ErrorStateMatcher;

  private readonly patternCode = '^\\d{5}$';

  public managerId = this.data.manager.id_u;

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      nom: [
        {
          value: this.data.project.nom_p,
          disabled: this.data.project.statut_p,
        },
        [Validators.required, Validators.minLength(3)],
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
    } else {
      const projets = await this.getProjets();
      if (await this.hasDuplicateProjectCode(this.data.project, projets)) {
        this.formGroup.get('code').setErrors({ duplicate: true });
        this.popupService.error(Messages.ERROR_FORM);
      }
      if (await this.hasDuplicateProjectName(this.data.project, projets)) {
        this.formGroup.get('nom').setErrors({ duplicate: true });
        this.popupService.error(Messages.ERROR_FORM);
      }
    }
    if (
      !this.formGroup.get('code').errors &&
      !this.formGroup.get('nom').errors
    ) {
      this.dialogRef.close({ data: this.data });
    }
  }

  private async hasDuplicateProjectCode(
    projet: Projet,
    projets: Projet[]
  ): Promise<boolean> {
    try {
      const projectCodes = projets.map((project) => project.code_p);
      const tempArray =
        projets.find(p =>
            p.id_p === projet.id_p && p.code_p === projet.code_p
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

  private async hasDuplicateProjectName(
    projet: Projet,
    projets: Projet[]
  ): Promise<boolean> {
    try {
      const projectNames = projets.map((project) => project.nom_p);
      const tempArray =
        projets.find(p =>
            p.id_p === projet.id_p && p.nom_p === projet.nom_p
        ) != null
          ? projectNames
          : projectNames.concat(projet.nom_p);
      return tempArray.some(
        (element, index) => tempArray.indexOf(element) !== index
      );
    } catch (e) {
      console.error(e);
    }
  }

  private async getProjets(): Promise<Projet[]> {
    try {
      return await this.projectsService.getAll();
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
