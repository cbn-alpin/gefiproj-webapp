import { SelectBoxOption } from './../../shared/components/generic-table/models/SelectBoxOption';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Financement, Statut_F } from 'src/app/models/financement';
import { Financeur } from 'src/app/models/financeur';
import { FinancementsService } from 'src/app/services/financements.service';
import { FinanceurService } from 'src/app/services/financeur.service';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableEntityEvent } from 'src/app/shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableInterface } from 'src/app/shared/components/generic-table/models/generic-table-interface';
import { GenericTableOptions } from 'src/app/shared/components/generic-table/models/generic-table-options';
import { IsAdministratorGuardService } from 'src/app/services/authentication/is-administrator-guard.service';
import { UsersService } from 'src/app/services/users.service';
import { EntitySelectBoxOptions } from 'src/app/shared/components/generic-table/models/entity-select-box-options';
import { GenericTableFormError } from 'src/app/shared/components/generic-table/models/generic-table-entity';
import { GenericDialogComponent, IMessage } from 'src/app/shared/components/generic-dialog/generic-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-financements',
  templateUrl: './financements.component.html',
  styleUrls: ['./financements.component.scss']
})
export class FinancementsComponent implements OnInit, GenericTableInterface<Financement>  {

  /**
   * Titre du tableau générique
   */
  readonly title = 'Financements';

  /**
   * id projet
   */
  public projectId: string;

  /**
   * Données source du tableau générique
   * @private
   */
  public financements: Financement[];

  /**
   * Liste de financeurs
   * @private
   */
  public financeurs: Financeur[];

  /**
   * Représente un nouveau financement et définit les colonnes à afficher.
   */
  private readonly defaultEntity: Financement = {
    id_f: undefined,
    id_p: undefined,
    id_financeur: undefined,
    montant_arrete_f: undefined,
    date_arrete_f: undefined,
    date_limite_solde_f: undefined,
    statut_f: Statut_F.ANTR,
    date_solde_f: undefined,
    commentaire_admin_f: undefined,
    commentaire_resp_f: undefined,
    numero_titre_f: undefined,
    annee_titre_f: undefined,
    imputation_f: undefined,
    difference: 0,
    financeur: undefined
  } ;

  /**
   * Mapping pour les noms des attributs d'un financement.
   */
  private readonly namesMap = {
    id_f: { code: 'id_f', name: 'Identifiant Financement' },
    id_p: { code: 'id_p', name: 'Identifiant Projet' },
    id_financeur: { code: 'id_financeur', name: 'Identifiant Financeur' },
    montant_arrete_f: { code: 'montant_arrete_f', name: 'Montant Arreté' },
    date_arrete_f: { code: 'date_arrete_f', name: 'Date arreté ou commande' },
    date_limite_solde_f: { code: 'date_limite_solde_f', name: 'Date limite de solde' },
    statut_f: { code: 'statut_f', name: 'Statut' },
    date_solde_f: { code: 'date_solde_f', name: 'Date de solde' },
    commentaire_admin_f: { code: 'commentaire_admin_f', name: 'Commentaire admin' },
    commentaire_resp_f: { code: 'commentaire_resp_f', name: 'Commentaire responsable' },
    numero_titre_f: { code: 'numero_titre_f', name: 'Numéro titre' },
    annee_titre_f: { code: 'annee_titre_f', name: 'Année titre' },
    imputation_f: { code: 'imputation_f', name: 'Imputation' },
    difference: { code: 'difference', name: 'Différence' },
    financeur: { code: 'id_financeur', name: 'Financeur' },
  };

  /**
   * Paramètres du tableau de financement.
   */
  options: GenericTableOptions<Financement> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      {name: this.namesMap.montant_arrete_f.name, type: GenericTableCellType.CURRENCY, code: this.namesMap.montant_arrete_f.code},
      {name: this.namesMap.date_arrete_f.name, type: GenericTableCellType.DATE, code: this.namesMap.date_arrete_f.code},
      {name: this.namesMap.date_limite_solde_f.name, type: GenericTableCellType.DATE, code: this.namesMap.date_limite_solde_f.code},
      {name: this.namesMap.financeur.name, type: GenericTableCellType.SELECTBOX, code: this.namesMap.financeur.code},
      {name: this.namesMap.statut_f.name, type: GenericTableCellType.SELECTBOX, code: this.namesMap.statut_f.code},
      {name: this.namesMap.date_solde_f.name, type: GenericTableCellType.DATE, code: this.namesMap.date_solde_f.code},
      {name: this.namesMap.commentaire_admin_f.name, type: GenericTableCellType.TEXTAREA, code: this.namesMap.commentaire_admin_f.code},
      {name: this.namesMap.commentaire_resp_f.name, type: GenericTableCellType.TEXTAREA, code: this.namesMap.commentaire_resp_f.code},
      {name: this.namesMap.numero_titre_f.name, type: GenericTableCellType.TEXT, code: this.namesMap.numero_titre_f.code},
      {name: this.namesMap.annee_titre_f.name, type: GenericTableCellType.TEXT, code: this.namesMap.annee_titre_f.code},
      {name: this.namesMap.imputation_f.name, type: GenericTableCellType.TEXT, code: this.namesMap.imputation_f.code},
      {name: this.namesMap.difference.name, type: GenericTableCellType.CURRENCY, code: this.namesMap.difference.code},
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: []
  };

    /**
   * Indique si le tableau peut-être modifié.
   */
  public get showActions(): boolean {
    return !!this.adminSrv.isAdministrator;
  }

  /**
   * Liste de statut
   */
  private statuts_financement: SelectBoxOption<any>[] = [
    {id: Statut_F.ANTR, label: Statut_F.ANTR},
    {id: Statut_F.ATR, label: Statut_F.ATR},
    {id: Statut_F.SOLDE, label: Statut_F.SOLDE},
  ];

  /**
   * Date Pipe
   */
  pipe: DatePipe;

  /**
   * 
   * @param adminSrv 
   * @param financementsService 
   * @param financeurService 
   * @param route 
   * @param router 
   * @param snackBar 
   */
  constructor(
    private adminSrv: IsAdministratorGuardService,
    private financementsService: FinancementsService,
    private financeurService: FinanceurService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.projectId = this.route.snapshot.params.id;
    if (!this.projectId) { this.router.navigate(['home']) }
  }

  /**
   * Initialise le composant.
   */
  async ngOnInit(): Promise<void> {
    try {
      this.pipe = new DatePipe('fr-FR');
      await this.loadData(Number(this.projectId));
      this.initDtOptions();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Initialise les options de la table générique.
   */
  private async loadData(projetId: number): Promise<void> {
    const promiseFinancements = this.loadFinancements(projetId);
    const promiseFinanceurs = this.loadFinanceurs();
    await Promise.all([promiseFinancements, promiseFinanceurs]); // Pour être plus efficace : les requêtes sont lancées en parallèle
  }

  /**
   * Charge les financements depuis le serveur.
   */
  async loadFinancements(projetId: number): Promise<Financement[]> {
    try {
      this.financements = (await this.financementsService.getAll(projetId)) || [];
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de charger les financements : ' + error.error);
      return Promise.reject(error);
    }
  }

  /**
   * Charge les financeurs depuis le serveur.
   */
  async loadFinanceurs(): Promise<Financeur[]> {
    try {
      this.financeurs = (await this.financeurService.getAll()) || [];
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de charger les financeurs : ' + error);
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
      values: this.financeurs?.map(f => ({ id: f.id_financeur, label: f.nom_financeur, item: f })) || []
    };
    const statutSelectBoxOption: EntitySelectBoxOptions<any> = {
      name: this.namesMap.statut_f.code,  
      values: this.statuts_financement
    };
    const entitySelectBoxOptions = [
      financeursSelectBoxOption,
      statutSelectBoxOption
    ];
    this.options = Object.assign({}, this.options, {
      dataSource,
      entitySelectBoxOptions
    });    
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

  /**
   * Met à jour les données d'affichage.
   */
  private async refreshDataTable() {
    try {
      await this.loadFinancements(Number(this.projectId));
      const dataSource = this.financements

      this.options = Object.assign({}, this.options, {
        dataSource
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Un financement a été modifié dans le tableau.
   * @param event : encapsule le financement à modifier.
   */
  async onEdit(event: GenericTableEntityEvent<Financement>): Promise<void> {
    try {
      let financement = event?.entity;
      if (!financement) {
        throw new Error('Le financement n\'existe pas');
      }
      financement = this.transformFormat(financement);

      if (this.validateForGenericTable(event)) {
        await this.financementsService.put(financement);
        await this.refreshDataTable();
        event.callBack(null); // Valide la modification dans le composant DataTable fils
      }
    } catch (error) {
      console.log('er', error)
      console.error(error.error.errors);
      for( const err of error.error.errors){
        console.log(err)
        this.showInformation('Impossible de modifier les financements : ' + err.message);
      }
    }
  }

  /**
   * transforme le format du formulaire
   * @param financement 
   */
  transformFormat(financement: Financement): Financement {
    if (financement?.financeur) delete financement?.financeur;
    if (financement.hasOwnProperty('difference')) { delete financement.difference; } 
    if (financement.hasOwnProperty('solde')) delete financement.solde;
    if (!financement.hasOwnProperty('id_p')) { financement.id_p = Number(this.projectId); }   
    // transform date
    if (financement.date_arrete_f) { financement.date_arrete_f = this.toTransformDateFormat(financement.date_arrete_f) }
    if (financement.date_limite_solde_f) { financement.date_limite_solde_f = this.toTransformDateFormat(financement.date_limite_solde_f) }
    if (financement.date_solde_f) { financement.date_solde_f = this.toTransformDateFormat(financement.date_solde_f) }

    return financement;
  }


  /**
   * Vérifie la validité du financement en paramètre. Si le financement est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule un nouveau financement ou un financement modifié.
   */
  private validateForGenericTable(gtEvent: GenericTableEntityEvent<Financement>): boolean {
    if (!gtEvent) {
      throw new Error('Le paramètre \'gtEvent\' est invalide');
    }

    try {
      const financement = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      this.verifForms(financement, formErrors);
      if (formErrors.length > 0) {
        gtEvent.callBack({
          formErrors
        });

        this.showInformation('Veuillez vérifier vos données');
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
  private verifForms(financement: Financement, formErrors: GenericTableFormError[]): void {    
    if (!financement.montant_arrete_f) {
      const error = {
        name: this.namesMap.montant_arrete_f.code,
        message: 'Un montant de financement doit être défini.'
      };
      formErrors.push(error);
    }

    if (!financement.statut_f) {
      const error = {
        name: this.namesMap.statut_f.code,
        message: 'Un statut de financement doit être défini.'
      };
      formErrors.push(error);
    }

    if (!financement.id_financeur) {
      const error = {
        name: this.namesMap.financeur.code,
        message: 'Un financeur doit être défini.'
      };
      formErrors.push(error);
    }
  }

  /**
   * Un financements a été créé et initialisé dans le tableau.
   * @param event : encapsule le financements à modifier.
   */
  async onCreate(event: GenericTableEntityEvent<Financement>): Promise<void> {
    try {
      let financement = event.entity;
      if (!financement) {
        throw new Error('Le financement n\'existe pas');
      }
      financement = this.transformFormat(financement);

      if (this.validateForGenericTable(event)) {
        await this.financementsService.post(financement);
        await this.refreshDataTable();
        event.callBack(null); // Valide la modification dans le composant DataTable fils
      }

    } catch (error) {
      console.error(error);
      for( const err of error.error.errors){
        this.showInformation('Impossible de créer le financement : ' + err.message);
      }
    }
  }


  /**
   * Supprimer un financement avec confirmation avec un popup
   * @param entity 
   */
 
  /**
   * Un financements a été supprimé du tableau.
   * @param event : encapsule le financements à modifier.
   */
  async onDelete(event: GenericTableEntityEvent<Financement>): Promise<void> {
    try {
      const financement = event?.entity;
      if (!financement) {
        throw new Error('Le financement n\'existe pas');
      }

      const dialogRef = this.dialog.open(GenericDialogComponent, {
        data: <IMessage>{
          header: 'Suppression du financement',
          content: 'Voulez-vous supprimer cet financement de montant ' + financement.montant_arrete_f + ' provenant du financeur ' + financement.financeur.nom_financeur + '?',
          type: 'warning',
          action: {
            name: 'Confirmer',
          }
        }
      }); 

      dialogRef.afterClosed().subscribe(
        async result => {
          if (result) {
            await this.financementsService.delete(financement);
            this.showInformation('Le financement de montant ' + financement.montant_arrete_f + '€, a été supprimé du projet.');
            await this.refreshDataTable();
            event.callBack(null);
          }
        }
      )

    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de supprimer le financement : ' + error.message);
      event?.callBack({
        apiError: 'Impossible de supprimer le financements.'
      });
    }
  }

  /**
   * transform date format to yyyy-MM-dd
   * @param date 
   */
  toTransformDateFormat(date): string {
    return this.pipe.transform(new Date(date), 'yyyy-MM-dd');
  }
}
