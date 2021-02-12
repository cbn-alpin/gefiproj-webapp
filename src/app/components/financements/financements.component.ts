import { SelectBoxOption } from '../../shared/components/generic-table/models/SelectBoxOption';
import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Financement, Statut_F } from 'src/app/models/financement';
import { Financeur } from 'src/app/models/financeur';
import { FundingsService } from 'src/app/services/fundings.service';
import { FinanceurService } from 'src/app/services/funders.service';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableEntityEvent } from 'src/app/shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from 'src/app/shared/components/generic-table/models/generic-table-options';
import { EntitySelectBoxOptions } from 'src/app/shared/components/generic-table/models/entity-select-box-options';
import { GenericTableFormError } from 'src/app/shared/components/generic-table/models/generic-table-entity';
import {
  GenericDialogComponent,
  IMessage,
} from 'src/app/shared/components/generic-dialog/generic-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PopupService } from '../../shared/services/popup.service';
import * as moment from 'moment';
import { take } from 'rxjs/operators';
import { SortInfo } from '../../shared/components/generic-table/models/sortInfo';
import { basicSort, getDeepCopy } from '../../shared/tools/utils';
import { DefaultSortInfo, Projet, ProjetCallback } from '../../models/projet';
import { ReceiptsService } from '../../services/receipts.service';
import { EntityType } from '../../shared/components/generic-table/models/entity-types';
import { Recette } from '../../models/recette';

/**
 * Affiche les financement.
 */
@Component({
  selector: 'app-financements',
  templateUrl: './financements.component.html',
  styleUrls: ['./financements.component.scss'],
})
export class FinancementsComponent implements OnInit, OnChanges {
  /**
   * Liste des financement.
   */
  @Input() public financements: Financement[];

  /**
   * Financement selectionné par défaut.
   */
  @Input() public selectedFinancement: Financement;

  /**
   * l'ordre de tri par défaut.
   */
  @Input() public defaultSortInfo: DefaultSortInfo;

  /**
   * Indique si l'utilisateur est un administrateur ou pas.
   */
  @Input() public isAdministrator: boolean;

  /**
   * Indique si l'utilisateur est le responsable du projet.
   */
  @Input() public isResponsable: boolean;

  /**
   * Indique si le projet est soldé ou pas.
   */
  @Input() public projectIsBalance: boolean;

  @Input() public disableAllActions = false;

  /**
   * Evénement de selection sur le tableau générique.
   */
  @Output() public selectEvent = new EventEmitter<Financement>();

  /**
   * Evénement de création sur le tableau générique.
   */
  @Output() public createEvent = new EventEmitter<ProjetCallback>();

  /**
   * Evénement d'édition sur le tableau générique.
   */
  @Output() public editEvent = new EventEmitter<ProjetCallback>();

  /**
   * Evénement de suppression sur le tableau générique.
   */
  @Output() public deleteEvent = new EventEmitter<ProjetCallback>();

  /**
   * Indique le début d'une action sur le tableau générique.
   */
  @Output() public startAction = new EventEmitter<void>();

  /**
   * Indique la fin d'une action sur le tableau générique.
   */
  @Output() public endAction = new EventEmitter<void>();

  /**
   * Titre du tableau générique
   */
  readonly title = 'Financements';

  /**
   * id projet
   */
  public projectId: string;

  /**
   * Liste de financeurs
   */
  public financeurs: Financeur[];

  /**
   * Afficher ou pas la colonne Actions du tableau générique.
   */
  public get showActions(): boolean {
    return (
      (this.isResponsable || this.isAdministrator) && !this.projectIsBalance
    );
  }

  /**
   * Afficher ou pas l'action de création sur le tableau générique.
   */
  public showCreateAction = true;

  /**
   * Afficher ou pas l'action d'édition sur le tableau générique.
   */
  public showEditAction = true;

  /**
   * Afficher ou pas l'action de suppression sur le tableau générique.
   */
  public showDeleteAction = true;

  /**
   * Représente un nouveau financement et définit les colonnes à afficher.
   */
  private readonly defaultEntity: Financement = {
    statut_f: Statut_F.ANTR,
  } as Financement;

  /**
   * Mapping pour les noms des attributs d'un financement.
   */
  private readonly namesMap = {
    id_f: { code: 'id_f', name: 'Identifiant Financement' },
    id_p: { code: 'id_p', name: 'Identifiant Projet' },
    id_financeur: { code: 'id_financeur', name: 'Identifiant Financeur' },
    montant_arrete_f: { code: 'montant_arrete_f', name: 'Montant arreté' },
    date_arrete_f: { code: 'date_arrete_f', name: 'Date arreté ou commande' },
    date_limite_solde_f: {
      code: 'date_limite_solde_f',
      name: 'Date limite de solde',
    },
    statut_f: { code: 'statut_f', name: 'Statut' },
    date_solde_f: { code: 'date_solde_f', name: 'Date de solde' },
    commentaire_admin_f: {
      code: 'commentaire_admin_f',
      name: 'Commentaire admin',
    },
    commentaire_resp_f: {
      code: 'commentaire_resp_f',
      name: 'Commentaire responsable',
    },
    numero_titre_f: { code: 'numero_titre_f', name: 'Numéro titre' },
    annee_titre_f: { code: 'annee_titre_f', name: 'Année titre' },
    imputation_f: { code: 'imputation_f', name: 'Imputation' },
    difference: { code: 'difference', name: 'Différence' },
    financeur: { code: 'id_financeur', name: 'Financeur' },
  };

  /**
   * Paramètres du tableau de financements.
   */
  options: GenericTableOptions<Financement>;

  /**
   * Liste des statuts d'un financement
   */
  private statutsFinancement: SelectBoxOption<any>[] = [
    { id: Statut_F.ANTR, label: Statut_F.ANTR },
    { id: Statut_F.ATR, label: Statut_F.ATR },
    { id: Statut_F.SOLDE, label: Statut_F.SOLDE },
  ];

  /**
   * Date Pipe
   */
  pipe: DatePipe;

  /**
   * L'ordre du tri dans le tableau générique.
   */
  private sortInfo: SortInfo;

  /**
   * Affiche les financements
   * @param adminSrv : permet de vérifier si l'utilisateur est un administrateur.
   * @param fundingsService : permet de charger les financements.
   * @param financeurService : permet de charger les financeurs.
   * @param route : permet la navigation.
   * @param router : permet la navigation.
   * @param popupService : affiche une information.
   * @param dialog : affiche une boîte de dialogue.
   */
  constructor(
    private fundingsService: FundingsService,
    private financeurService: FinanceurService,
    private route: ActivatedRoute,
    private router: Router,
    private popupService: PopupService,
    private dialog: MatDialog,
    private receiptsService: ReceiptsService
  ) {
    this.projectId = this.route.snapshot.params.id;
    if (!this.projectId) {
      this.router.navigate(['home']);
    }
  }

  /**
   * Initialise le composant.
   */
  public async ngOnInit(): Promise<void> {
    try {
      this.initGenericTableOptions();
      this.pipe = new DatePipe('fr-FR');
      await this.loadFinanceurs();
      this.initDtOptions();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Raffraichi le composant si on detecte des changements.
   */
  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      changes.financements &&
      changes.financements.currentValue &&
      changes.financements.previousValue
    ) {
      this.refreshDataTable();
    }
    if (
      changes.isResponsable &&
      changes.isResponsable.currentValue != null &&
      changes.isResponsable.previousValue != null
    ) {
      this.updateTableActionWithUserRight();
      this.updateEntityTypesWithUserRight();
    }
  }

  /**
   * Un financement a été modifié dans le tableau.
   * @param event : encapsule le financement à modifier.
   */
  public async onEdit(
    event: GenericTableEntityEvent<Financement>
  ): Promise<void> {
    try {
      let financement: Financement = event.entity;
      if (!financement) {
        throw new Error('Le financement n\'existe pas');
      }
      financement = this.transformFormat(financement);

      if (await this.validateForGenericTable(event)) {
        let updatedFinancement = await this.fundingsService.modify(
          financement
        );
        updatedFinancement = this.loadFinanceurInFinancement(
          updatedFinancement
        );
        const projetCallback: ProjetCallback = {
          cb: event.callBack,
          id: updatedFinancement.id_f,
          message: 'Le financement a été modifié',
        };
        this.editEvent.emit(projetCallback);
      }
    } catch (error) {
      event?.callBack({
        apiError: error,
      });
    }
  }

  /**
   * transforme le format du formulaire pour une création ou d'une modification.
   * @param financement
   */
  private transformFormat(financement: Financement): Financement {
    const copiedFinancement = getDeepCopy(financement);
    if (copiedFinancement.hasOwnProperty('difference')) {
      delete copiedFinancement.difference;
    }
    if (copiedFinancement?.financeur) {
      delete copiedFinancement?.financeur; }
    if (copiedFinancement.hasOwnProperty('solde')) {
      delete copiedFinancement.solde;
    }
    if (!copiedFinancement.hasOwnProperty('id_p')) {
      copiedFinancement.id_p = Number(this.projectId);
    }
    // transform date
    if (copiedFinancement.date_arrete_f) {
      copiedFinancement.date_arrete_f = this.toTransformDateFormat(
        copiedFinancement.date_arrete_f
      );
    }
    if (copiedFinancement.date_limite_solde_f) {
      copiedFinancement.date_limite_solde_f = this.toTransformDateFormat(
        copiedFinancement.date_limite_solde_f
      );
    }
    if (copiedFinancement.date_solde_f) {
      copiedFinancement.date_solde_f = this.toTransformDateFormat(
        copiedFinancement.date_solde_f
      );
    }

    return copiedFinancement;
  }

  /**
   * Vérifie la validité du financement en paramètre. Si le financement est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule un nouveau financement ou un financement modifié.
   */
  private async validateForGenericTable(
    gtEvent: GenericTableEntityEvent<Financement>
  ): Promise<boolean> {
    if (!gtEvent) {
      throw new Error('Le paramètre \'gtEvent\' est invalide');
    }

    try {
      const financement = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      this.verifForms(financement, formErrors);

      // Vérifie seulement si pas d'erreurs dans le form
      // Évite de faire un appel API alors que le form n'est pas valide
      // Si id_f est null alors le financement est en cours de création => les règles ci-dessous ne s'appliquent pas dans ce cas de figure
      if (!formErrors.length && financement.id_f) {
        const recettes = await this.getRecettesFromFinancement(financement);
        await this.checkValidityOfDateArreteFinancementWithRecetteYears(
          financement,
          recettes,
          formErrors
        );
        await this.checkValidityOfAmountFinancementWithRecetteAmount(
          financement,
          recettes,
          formErrors
        );
      }
      if (formErrors.length > 0) {
        gtEvent.callBack({
          formErrors,
        });

        this.popupService.error('Veuillez vérifier vos données');
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error(error);
      return true; // Problème inattendu : le serveur vérifiera les données
    }
  }

  /**
   * Vérifie la validité des champs d'un financement.
   * @param financement : financement à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifForms(
    financement: Financement,
    formErrors: GenericTableFormError[]
  ): void {
    if (!financement.montant_arrete_f) {
      const error = {
        name: this.namesMap.montant_arrete_f.code,
        message: 'Un montant de financement doit être défini et supérieur à 0.',
      };
      formErrors.push(error);
    }

    if (!financement.statut_f) {
      const error = {
        name: this.namesMap.statut_f.code,
        message: 'Un statut de financement doit être défini.',
      };
      formErrors.push(error);
    }

    if (!financement.id_financeur) {
      const error = {
        name: this.namesMap.financeur.code,
        message: 'Un financeur doit être défini.',
      };
      formErrors.push(error);
    }

    if (financement.commentaire_admin_f && financement.commentaire_admin_f.length > 240) {
      const error = {
        name: this.namesMap.commentaire_admin_f.code,
        message: 'Le commentaire administrateur est trop long.',
      };
      formErrors.push(error);
    }

    if (financement.commentaire_resp_f && financement.commentaire_resp_f.length > 240) {
      const error = {
        name: this.namesMap.commentaire_resp_f.code,
        message: 'Le commentaire du responsable est trop long.',
      };
      formErrors.push(error);
    }

    if (
      financement.date_arrete_f &&
      financement.date_limite_solde_f &&
      moment(financement.date_arrete_f).isAfter(financement.date_limite_solde_f)
    ) {
      const errord1 = {
        name: this.namesMap.date_arrete_f.code,
        message:
          'format date non respecté : la date arrêté ou commande est postérieure à la date limite de solde.',
      };
      const errord2 = {
        name: this.namesMap.date_limite_solde_f.code,
        message:
          'format date non respecté : la date limite de solde est antérieure à la date arrêté ou commande.',
      };
      formErrors.push(errord1);
      formErrors.push(errord2);
    }

    if (
      financement.date_arrete_f &&
      financement.date_solde_f &&
      moment(financement.date_arrete_f).isAfter(financement.date_solde_f)
    ) {
      const errord1 = {
        name: this.namesMap.date_arrete_f.code,
        message:
          'format date non respecté : la date arrêté ou commande est postérieure à la date de solde.',
      };
      const errord2 = {
        name: this.namesMap.date_solde_f.code,
        message:
          'format date non respecté : la date de solde est antérieure à la date arrêté ou commande.',
      };
      formErrors.push(errord1);
      formErrors.push(errord2);
    }

    if (financement.statut_f === Statut_F.SOLDE && !financement.date_solde_f) {
      const error1 = {
        name: this.namesMap.statut_f.code,
        message:
          'Impossible de solder le financement car la date de solde doit être défini.',
      };
      const error2 = {
        name: this.namesMap.date_solde_f.code,
        message:
          'La date de solde doit être défini pour solder le financement.',
      };
      formErrors.push(error1);
      formErrors.push(error2);
    }
  }

  /**
   * Un financement a été créé et initialisé dans le tableau.
   * @param event : encapsule le financement à ajouter.
   */
  public async onCreate(
    event: GenericTableEntityEvent<Financement>
  ): Promise<void> {
    try {
      let financement: Financement = event.entity;
      if (!financement) {
        throw new Error('Le financement n\'existe pas');
      }
      financement = this.transformFormat(financement);
      if (await this.validateForGenericTable(event)) {
        let createdFinancement = await this.fundingsService.add(
          financement
        );
        createdFinancement = this.loadFinanceurInFinancement(
          createdFinancement
        );
        this.selectedFinancement = createdFinancement;
        const projetCallback: ProjetCallback = {
          cb: event.callBack,
          id: createdFinancement.id_f,
          message: 'Le financement a été créé',
        };
        this.createEvent.emit(projetCallback);
      }
    } catch (error) {
      event?.callBack({
        apiError: error,
      });
    }
  }

  /**
   * Un financements a été supprimé du tableau.
   * @param event : encapsule le financement à supprimer.
   */
  public async onDelete(
    event: GenericTableEntityEvent<Financement>
  ): Promise<void> {
    const financement = event.entity;
    if (!financement) {
      throw new Error('Le financement n\'existe pas');
    }

    const dialogRef = this.dialog.open(GenericDialogComponent, {
      data: {
        header: 'Suppression du financement',
        content: `Les données reliées à ce financement (recettes et montants affectés inclus) seront également supprimées.<br> <br>Confirmez-vous la suppression de ce financement d'un montant de ${financement.montant_arrete_f} provenant du financeur ${financement.financeur.nom_financeur} ?`,
        type: 'warning',
        action: {
          name: 'Confirmer',
        },
      } as IMessage,
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(async (result) => {
        if (result) {
          try {
            await this.fundingsService.delete(financement);
            const projetCallback: ProjetCallback = {
              cb: event.callBack,
              id: financement.id_f,
              message:
                'Le financement de montant ' +
                financement.montant_arrete_f +
                '€, a été supprimé du projet.',
            };
            this.deleteEvent.emit(projetCallback);
          } catch (error) {
            event?.callBack({
              apiError: error,
            });
          }
        }
      });
  }

  /**
   * Gére la sélection d'une entité
   * @param entity
   */
  public onSelect(
    genericTableEntityEvent: GenericTableEntityEvent<Financement>
  ): void {
    this.selectEvent.emit(genericTableEntityEvent.entity);
  }

  /**
   * Le trie du tableau a changé.
   * @param sort : défini le trie à appliquer.
   */
  public onSortChanged(sort: SortInfo): void {
    try {
      if (sort) {
        this.sortInfo = sort;
        this.refreshDataTable();
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Détecte le début d'une action sur le tableau générique.
   */
  public onStartAction(): void {
    this.startAction.emit();
  }

  /**
   * Détecte la fin d'une action sur le tableau générique.
   */
  public onEndAction(): void {
    this.endAction.emit();
  }

  /**
   * transform date format to yyyy-MM-dd
   * @param date
   */
  private toTransformDateFormat(date): string {
    return this.pipe.transform(new Date(date), 'yyyy-MM-dd');
  }

  private initGenericTableOptions(): void {
    this.options = {
      dataSource: this.financements,
      defaultEntity: this.defaultEntity,
      entityTypes: [
        {
          name: this.namesMap.montant_arrete_f.name,
          type: GenericTableCellType.CURRENCY,
          code: this.namesMap.montant_arrete_f.code,
          sortEnabled: true,
          isMandatory: true,
        },
        {
          name: this.namesMap.date_arrete_f.name,
          type: GenericTableCellType.DATE,
          code: this.namesMap.date_arrete_f.code,
          sortEnabled: true,
        },
        {
          name: this.namesMap.date_limite_solde_f.name,
          type: GenericTableCellType.DATE,
          code: this.namesMap.date_limite_solde_f.code,
          sortEnabled: true,
        },
        {
          name: this.namesMap.financeur.name,
          type: GenericTableCellType.SELECTBOX,
          code: this.namesMap.financeur.code,
          sortEnabled: true,
          isMandatory: true,
        },
        {
          name: this.namesMap.statut_f.name,
          type: GenericTableCellType.SELECTBOX,
          code: this.namesMap.statut_f.code,
          sortEnabled: true,
          isMandatory: true,
        },
        {
          name: this.namesMap.date_solde_f.name,
          type: GenericTableCellType.DATE,
          code: this.namesMap.date_solde_f.code,
          sortEnabled: true,
        },
        {
          name: this.namesMap.commentaire_admin_f.name,
          type: GenericTableCellType.TEXTAREA,
          code: this.namesMap.commentaire_admin_f.code,
        },
        {
          name: this.namesMap.commentaire_resp_f.name,
          type: GenericTableCellType.TEXTAREA,
          code: this.namesMap.commentaire_resp_f.code,
        },
        {
          name: this.namesMap.numero_titre_f.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.numero_titre_f.code,
        },
        {
          name: this.namesMap.annee_titre_f.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.annee_titre_f.code,
        },
        {
          name: this.namesMap.imputation_f.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.imputation_f.code,
        },
        {
          name: this.namesMap.difference.name,
          type: GenericTableCellType.CURRENCY,
          code: this.namesMap.difference.code,
          sortEnabled: true,
          disableEditing: true,
          tooltipHeader:
            'Indique la différence entre le montant du financement et de ses recettes.',
        },
      ],
      entityPlaceHolders: [],
      entitySelectBoxOptions: [],
      sortName: this.defaultSortInfo?.headerName,
      sortDirection: this.defaultSortInfo?.sortInfo?.direction,
      idPropertyName: this.namesMap.id_f.code,
    };
    this.updateTableActionWithUserRight();
    this.updateEntityTypesWithUserRight();
  }

  /**
   * Charge le financeur d'un financement.
   * @param financement : le financement concerné.
   */
  private loadFinanceurInFinancement(financement: Financement): Financement {
    return financement.id_financeur
      ? {
        ...financement,
        financeur: this.financeurs.find(
          (financeur) => financeur.id_financeur === financement.id_financeur
        ),
      }
      : financement;
  }

  /**
   * Charge les financeurs depuis le serveur.
   */
  private async loadFinanceurs(): Promise<Financeur[]> {
    try {
      this.financeurs = (await this.financeurService.getAll()) || [];
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de charger les financeurs : ' + error
      );
      return Promise.reject(error);
    }
  }

  /**
   * Initialise les options de la table générique.
   */
  private initDtOptions(): void {
    const dataSource = this.financements;
    const financeursSelectBoxOption: EntitySelectBoxOptions<Financeur> = {
      name: this.namesMap.financeur.code,
      values:
        this.financeurs?.map((f) => ({
          id: f.id_financeur,
          label: f.nom_financeur,
          item: f,
        })) || [],
    };
    const statutSelectBoxOption: EntitySelectBoxOptions<any> = {
      name: this.namesMap.statut_f.code,
      values: this.statutsFinancement,
    };
    const entitySelectBoxOptions = [
      financeursSelectBoxOption,
      statutSelectBoxOption,
    ];
    this.options = Object.assign({}, this.options, {
      dataSource,
      entitySelectBoxOptions,
    });
  }
  /**
   * Rafraichit le tableau générique.
   */
  private refreshDataTable(): void {
    this.options = {
      ...this.options,
      dataSource: basicSort(this.financements, this.sortInfo),
    };
  }

  /**
   * Désactive l'édition des colonnes qui ne correspondent pas aux colonnes passé en paramètre.
   * @param entityTypes : les types des champs de l'entité.
   * @param editableFields : les champs modifiables.
   * @private
   */
  private disableAllEditingFieldsExcept(
    entityTypes: EntityType[],
    editableFields: string[]
  ): EntityType[] {
    return entityTypes.map((entityType) =>
      editableFields.find(
        (editableField) => editableField === entityType.code
      ) != null
        ? {
          ...entityType,
          disableEditing: false,
        }
        : {
          ...entityType,
          disableEditing: true,
        }
    );
  }

  /**
   * Met à jour les actions du tableau selon le role de l'utilisateur.
   * @private
   */
  private updateTableActionWithUserRight(): void {
    if (!this.isAdministrator && this.isResponsable) {
      this.showCreateAction = false;
      this.showDeleteAction = false;
    } else {
      this.showCreateAction = true;
      this.showDeleteAction = true;
    }
  }

  /**
   * Désactive l'édition de certaines colonnes selon le rôle de l'utilisateur.
   * @private
   */
  private updateEntityTypesWithUserRight(): void {
    let upEntityTypes: EntityType[];
    const codes = this.options.entityTypes.map((entityType) => entityType.code);
    if (this.isAdministrator && !this.isResponsable) {
      const editableRowsCode = codes.filter(
        (code) =>
          code !== this.namesMap.commentaire_resp_f.code &&
          code !== this.namesMap.difference.code
      );
      upEntityTypes = this.disableAllEditingFieldsExcept(
        this.options.entityTypes,
        editableRowsCode
      );
    } else if (this.isAdministrator && this.isResponsable) {
      const editableRowsCode = codes.filter(
        (code) => code !== this.namesMap.difference.code
      );
      upEntityTypes = this.disableAllEditingFieldsExcept(
        this.options.entityTypes,
        editableRowsCode
      );
    } else if (!this.isAdministrator && this.isResponsable) {
      upEntityTypes = this.disableAllEditingFieldsExcept(
        this.options.entityTypes,
        [this.namesMap.commentaire_resp_f.code]
      );
    }
    if (upEntityTypes) {
      this.options = {
        ...this.options,
        entityTypes: upEntityTypes,
      };
    }
  }

  /**
   * Vérifie que la date arrête du financement est inférieur ou égale à l'année de toutes ses recettes.
   * @param financement : le financement concerné.
   * @param recettes : les recettes du financement concerné.
   * @param formErrors : liste des erreurs de validation.
   * @private
   */
  private async checkValidityOfDateArreteFinancementWithRecetteYears(
    financement: Financement,
    recettes: Recette[],
    formErrors: GenericTableFormError[]
  ): Promise<void> {
    try {
      const recettesYears = recettes.map((recette) => recette.annee_r);
      const yearArreteFinancement = new Date(
        financement.date_arrete_f
      ).getFullYear();
      const validRecettesYears = recettesYears.filter(
        (year) => year >= yearArreteFinancement
      );
      if (validRecettesYears.length !== recettesYears.length) {
        const error = {
          name: this.namesMap.date_arrete_f.code,
          message: 'Doit être antérieure ou égale aux années de ses recettes',
        };
        formErrors.push(error);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Vérifie que le montant du financement est supérieur ou égale à la somme des montants de ses recettes
   * @param financement : le financement concerné.
   * @param formErrors : liste des erreurs de validation.
   * @private
   */
  private async checkValidityOfAmountFinancementWithRecetteAmount(
    financement: Financement,
    recettes: Recette[],
    formErrors: GenericTableFormError[]
  ): Promise<void> {
    try {
      const recettesAmounts = recettes.map((recette) => recette.montant_r);
      const sumRecettesAmounts = recettesAmounts.reduce((a, b) => a + b, 0);
      if (sumRecettesAmounts > financement.montant_arrete_f) {
        const error = {
          name: this.namesMap.montant_arrete_f.code,
          message:
            'Doit être supérieur ou égale à la somme des montants de ses recettes',
        };
        formErrors.push(error);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Récupère les recette d'un financement.
   * @param financement : le financement concerné.
   * @private
   */
  private async getRecettesFromFinancement(
    financement: Financement
  ): Promise<Recette[]> {
    try {
      return await this.receiptsService.getAllFromFunding(financement.id_f);
    } catch (e) {
      console.error(e);
    }
  }
}
