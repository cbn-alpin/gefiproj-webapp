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
import { FinancementsService } from 'src/app/services/financements.service';
import { FinanceurService } from 'src/app/services/funders.service';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableEntityEvent } from 'src/app/shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from 'src/app/shared/components/generic-table/models/generic-table-options';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
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

@Component({
  selector: 'app-financements',
  templateUrl: './financements.component.html',
  styleUrls: ['./financements.component.scss'],
})
export class FinancementsComponent implements OnInit, OnChanges {
  /**
   * Données source du tableau générique
   * @private
   */
  @Input() public financements: Financement[];

  @Input() public selectedFinancement: Financement;

  @Output()
  public selectEvent: EventEmitter<Financement> = new EventEmitter<Financement>();

  @Output() public createEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output() public editEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output() public deleteEvent: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public financementsChange: EventEmitter<Financement[]> = new EventEmitter<
    Financement[]
  >();

  @Output()
  public selectedFinancementChange: EventEmitter<Financement> = new EventEmitter<Financement>();

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
   * @private
   */
  public financeurs: Financeur[];

  /**
   * Représente un nouveau financement et définit les colonnes à afficher.
   */
  private readonly defaultEntity: Financement = {
    statut_f: Statut_F.ANTR,
    difference: 0,
  } as Financement;

  /**
   * Mapping pour les noms des attributs d'un financement.
   */
  private readonly namesMap = {
    id_f: { code: 'id_f', name: 'Identifiant Financement' },
    id_p: { code: 'id_p', name: 'Identifiant Projet' },
    id_financeur: { code: 'id_financeur', name: 'Identifiant Financeur' },
    montant_arrete_f: { code: 'montant_arrete_f', name: 'Montant Arreté' },
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
   * Paramètres du tableau de financement.
   */
  options: GenericTableOptions<Financement>;

  /**
   * Indique si le tableau peut-être modifié.
   */
  public get showActions(): boolean {
    return !!this.adminSrv.isAdministrator();
  }

  /**
   * Liste de statut
   */
  private statuts_financement: SelectBoxOption<any>[] = [
    { id: Statut_F.ANTR, label: Statut_F.ANTR },
    { id: Statut_F.ATR, label: Statut_F.ATR },
    { id: Statut_F.SOLDE, label: Statut_F.SOLDE },
  ];

  /**
   * Date Pipe
   */
  pipe: DatePipe;

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
   * @param adminSrv
   * @param financementsService
   * @param financeurService
   * @param route
   * @param router
   * @param popupService
   * @param dialog
   */
  constructor(
    private adminSrv: IsAdministratorGuardService,
    private financementsService: FinancementsService,
    private financeurService: FinanceurService,
    private route: ActivatedRoute,
    private router: Router,
    private popupService: PopupService,
    private dialog: MatDialog
  ) {
    this.projectId = this.route.snapshot.params.id;
    if (!this.projectId) {
      this.router.navigate(['home']);
    }
  }

  public async ngOnInit() {
    this.initGenericTableOptions();
    try {
      this.pipe = new DatePipe('fr-FR');
      await this.loadFinanceurs();
      this.initDtOptions();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Initialise le composant.
   */
  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.financements && changes.financements.currentValue) {
      this.options = {
        ...this.options,
        dataSource: this.financements,
      };
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
        throw new Error("Le financement n'existe pas");
      }
      financement = this.transformFormat(financement);

      if (this.validateForGenericTable(event)) {
        let updatedFinancement = await this.financementsService.put(
          financement
        );
        updatedFinancement = this.loadFinanceurInFinancement(
          updatedFinancement
        );
        event.callBack(null);
        this.modify(updatedFinancement);
        this.editEvent.emit();
        this.popupService.success('Le financement a été modifié.');
      }
    } catch (error) {
      console.error(error.error.errors);
      if (error.error.errors) {
        for (const err of error.error.errors) {
          event?.callBack({
            apiError: 'Impossible de modifier le financement : ' + err.message,
          });
        }
      } else {
        event?.callBack({
          apiError: 'Impossible de modifier le financement : ' + error.error,
        });
      }
    }
  }

  /**
   * transforme le format du formulaire
   * @param financement
   */
  private transformFormat(financement: Financement): Financement {
    if (financement?.financeur) delete financement?.financeur;
    if (financement.hasOwnProperty('difference')) {
      delete financement.difference;
    }
    if (financement.hasOwnProperty('solde')) delete financement.solde;
    if (!financement.hasOwnProperty('id_p')) {
      financement.id_p = Number(this.projectId);
    }
    // transform date
    if (financement.date_arrete_f) {
      financement.date_arrete_f = this.toTransformDateFormat(
        financement.date_arrete_f
      );
    }
    if (financement.date_limite_solde_f) {
      financement.date_limite_solde_f = this.toTransformDateFormat(
        financement.date_limite_solde_f
      );
    }
    if (financement.date_solde_f) {
      financement.date_solde_f = this.toTransformDateFormat(
        financement.date_solde_f
      );
    }

    return financement;
  }

  /**
   * Vérifie la validité du financement en paramètre. Si le financement est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule un nouveau financement ou un financement modifié.
   */
  private validateForGenericTable(
    gtEvent: GenericTableEntityEvent<Financement>
  ): boolean {
    if (!gtEvent) {
      throw new Error("Le paramètre 'gtEvent' est invalide");
    }

    try {
      const financement = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      this.verifForms(financement, formErrors);
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
   * Vérifie le forms du financement.
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

    if (!financement.date_solde_f) {
      const error = {
        name: this.namesMap.date_solde_f.code,
        message: 'La date de solde doit être défini.',
      };
      formErrors.push(error);
    }

    if (financement.date_arrete_f && financement.date_limite_solde_f && moment(financement.date_arrete_f).isAfter(financement.date_limite_solde_f)) {
      const errord1 = {
        name: this.namesMap.date_arrete_f.code,
        message: 'format date non respecté : la date arrêté ou commande est postérieure à la date limite de solde.',
      };
      const errord2 = {
        name: this.namesMap.date_limite_solde_f.code,
        message: 'format date non respecté : la date limite de solde est antérieur à la date arrêté ou commande.',
      };
      formErrors.push(errord1);
      formErrors.push(errord2);
    }

    if (financement.date_arrete_f && financement.date_solde_f && moment(financement.date_arrete_f).isAfter(financement.date_solde_f)) {
      const errord1 = {
        name: this.namesMap.date_arrete_f.code,
        message: 'format date non respecté : la date arrêté ou commande est postérieure à la date de solde.',
      };
      const errord2 = {
        name: this.namesMap.date_solde_f.code,
        message: 'format date non respecté : la date de solde est antérieur à la date arrêté ou commande.',
      };
      formErrors.push(errord1);
      formErrors.push(errord2);
    }
  }

  /**
   * Un financements a été créé et initialisé dans le tableau.
   * @param event : encapsule le financement à modifier.
   */
  public async onCreate(
    event: GenericTableEntityEvent<Financement>
  ): Promise<void> {
    try {
      let financement: Financement = event.entity;
      if (!financement) {
        throw new Error("Le financement n'existe pas");
      }
      financement = this.transformFormat(financement);

      if (this.validateForGenericTable(event)) {
        let createdFinancement = await this.financementsService.post(
          financement
        );
        createdFinancement = this.loadFinanceurInFinancement(
          createdFinancement
        );
        event.callBack(null); // Valide la modification dans le composant DataTable fils
        this.create(createdFinancement);
        this.selectedFinancement = createdFinancement;
        this.popupService.success('Le financement a été crée.');
        this.createEvent.emit();
      }
    } catch (error) {
      console.error(error);
      if (error.error.errors) {
        for (const err of error.error.errors) {
          event?.callBack({
            apiError: 'Impossible de créer le financement : ' + err.message,
          });
        }
      } else {
        event?.callBack({
          apiError: 'Impossible de créer le financement : ' + error.error,
        });
      }
    }
  }

  /**
   * Un financements a été supprimé du tableau.
   * @param event : encapsule le financement à modifier.
   */
  public async onDelete(
    event: GenericTableEntityEvent<Financement>
  ): Promise<void> {
    const financement = event.entity;
    if (!financement) {
      throw new Error("Le financement n'existe pas");
    }

    const dialogRef = this.dialog.open(GenericDialogComponent, {
      data: {
        header: 'Suppression du financement',
        content: `Les données reliées à ce financement seront supprimés suite à sa suppression.<br>Confirmez-vous la suppression de ce financement d'un montant de ${financement.montant_arrete_f} provenant du financeur ${financement.financeur.nom_financeur} ?`,
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
            await this.financementsService.delete(financement);
            event.callBack(null);
            this.delete(financement);
            this.popupService.success(
              'Le financement de montant ' +
                financement.montant_arrete_f +
                '€, a été supprimé du projet.'
            );
          } catch (error) {
            event?.callBack({
              apiError:
                'Impossible de supprimer le financement : ' + error.error,
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

  public onSelectedEntityChange(financement: Financement): void {
    this.selectedFinancementChange.emit(financement);
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
        },
        {
          name: this.namesMap.date_arrete_f.name,
          type: GenericTableCellType.DATE,
          code: this.namesMap.date_arrete_f.code,
        },
        {
          name: this.namesMap.date_limite_solde_f.name,
          type: GenericTableCellType.DATE,
          code: this.namesMap.date_limite_solde_f.code,
        },
        {
          name: this.namesMap.financeur.name,
          type: GenericTableCellType.SELECTBOX,
          code: this.namesMap.financeur.code,
        },
        {
          name: this.namesMap.statut_f.name,
          type: GenericTableCellType.SELECTBOX,
          code: this.namesMap.statut_f.code,
        },
        {
          name: this.namesMap.date_solde_f.name,
          type: GenericTableCellType.DATE,
          code: this.namesMap.date_solde_f.code,
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
        },
      ],
      entityPlaceHolders: [],
      entitySelectBoxOptions: [],
    };
  }

  private create(financement: Financement): void {
    this.financements.push(financement);
    this.emitFinancementsChange();
  }

  private modify(financement: Financement): void {
    const index = this.financements.findIndex(
      (_financement) => _financement.id_f === financement.id_f
    );
    this.financements[index] = financement;
    this.emitFinancementsChange();
  }

  private delete(financement: Financement): void {
    this.financements = this.financements.filter(
      (_financement) => _financement.id_f !== financement.id_f
    );
    this.emitFinancementsChange();
  }

  private emitFinancementsChange(): void {
    this.financementsChange.emit(this.financements);
  }

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
      values: this.statuts_financement,
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
}
