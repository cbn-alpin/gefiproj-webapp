import { Component, OnInit } from '@angular/core';
import {MontantAffecte} from '../../models/montantAffecte';
import {Recette} from '../../models/recette';
import {GenericTableOptions} from '../../shared/components/generic-table/models/generic-table-options';
import {GenericTableCellType} from '../../shared/components/generic-table/globals/generic-table-cell-types';
import {DatePipe} from '@angular/common';
import {IsAdministratorGuardService} from '../../services/authentication/is-administrator-guard.service';
import {MontantsAffectesService} from '../../services/montants-affectes.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import {GenericTableEntityEvent} from '../../shared/components/generic-table/models/generic-table-entity-event';
import {GenericTableFormError} from '../../shared/components/generic-table/models/generic-table-entity';
import {GenericDialogComponent, IMessage} from '../../shared/components/generic-dialog/generic-dialog.component';

@Component({
  selector: 'app-montants-affectes',
  templateUrl: './montants-affectes.component.html',
  styleUrls: ['./montants-affectes.component.scss']
})
export class MontantsAffectesComponent implements OnInit {

  /**
   * Titre du tableau générique
   */
  readonly title = 'Montants Affectés';

  /**
   * id recette
   */
  public receiptId: string;

  /**
   * Données source du tableau générique
   * @private
   */
  public montantsAffectes: MontantAffecte[];

  /**
   * Représente un nouveau montant affecté et définit les colonnes à afficher.
   */
  private readonly defaultEntity: MontantAffecte = {
    id_ma: undefined,
    recette: undefined,
    montant_ma: undefined,
    annee_ma: undefined,
  } ;

  /**
   * Mapping pour les noms des attributs d'un montant affecté.
   */
  private readonly namesMap = {
    id_ma: { code: 'id_f', name: 'Identifiant Montant Affecté' },
    recette: { code: 'id_r', name: 'Recette' },
    montant_ma: { code: 'montant_ma', name: 'Montant' },
    annee_ma: { code: 'annee_ma', name: 'Année d\'affectation' },
  };

  /**
   * Paramètres du tableau des montants affectés.
   */
  options: GenericTableOptions<MontantAffecte> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      {name: this.namesMap.montant_ma.name, type: GenericTableCellType.CURRENCY, code: this.namesMap.montant_ma.code},
      {name: this.namesMap.annee_ma.name, type: GenericTableCellType.NUMBER, code: this.namesMap.annee_ma.code},
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
    return !!this.adminSrv.isAdministrator;
  }

  /**
   *
   * @param adminSrv : permet de vérifier si l'utilisateur est un administrateur.
   * @param MontantsAffectesService
   * @param route
   * @param router
   * @param snackBar : affiche une information.
   * @param dialog
   */
  constructor(
    private adminSrv: IsAdministratorGuardService,
    private montantsAffectesService: MontantsAffectesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) {
    this.receiptId = '';
    //if (!this.projectId) { this.router.navigate(['home']) }
  }
  /**
   * Initialise le composant.
   */
  async ngOnInit(): Promise<void> {
    try {
      this.pipe = new DatePipe('fr-FR');
      await this.loadMontantsAffectes(Number(this.receiptId));
      this.initDtOptions();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Charge les montants affectes depuis le serveur.
   */
  async loadMontantsAffectes(receiptId: number): Promise<MontantAffecte[]> {
    try {
      receiptId = 3;
      this.montantsAffectes = (await this.montantsAffectesService.getAll(receiptId)) || [];
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de charger les montants affectés : ' + error.error);
      return Promise.reject(error);
    }
  }

  /**
   * Initialise les options de la table générique.
   */
  private initDtOptions(): void {
    const dataSource = this.montantsAffectes;
    this.options = Object.assign({}, this.options, {
      dataSource,
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
      await this.loadMontantsAffectes(Number(this.receiptId));
      const dataSource = this.montantsAffectes;

      this.options = Object.assign({}, this.options, {
        dataSource
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Un montant affecté a été modifié dans le tableau.
   * @param event : encapsule le montant affecté à modifier.
   */
  async onEdit(event: GenericTableEntityEvent<MontantAffecte>): Promise<void> {
    try {
      let montant = event?.entity;
      if (!montant) {
        throw new Error('Le montant affecté n\'existe pas');
      }

      if (this.validateForGenericTable(event)) {
        await this.montantsAffectesService.put(montant);
        await this.refreshDataTable();
        event.callBack(null); // Valide la modification dans le composant DataTable fils
      }
    } catch (error) {
      console.log('er', error)
      console.error(error.error.errors);
      for( const err of error.error.errors){
        console.log(err)
        this.showInformation('Impossible de modifier les montants affectés : ' + err.message);
      }
    }
  }

  /**
   * Vérifie la validité du montant affecté en paramètre. Si le montant affecté est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule un nouveau montant affecté ou un montant affecté modifié.
   */
  private validateForGenericTable(gtEvent: GenericTableEntityEvent<MontantAffecte>): boolean {
    if (!gtEvent) {
      throw new Error('Le paramètre \'gtEvent\' est invalide');
    }

    try {
      const montant = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      this.verifForms(montant, formErrors);
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
   * Vérifie le forms du montant affecté.
   * @param montant affecté : montant affecté à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifForms(montant: MontantAffecte, formErrors: GenericTableFormError[]): void {
    if (!montant.montant_ma) {
      const error = {
        name: this.namesMap.montant_ma.code,
        message: 'Un montant doit être défini.'
      };
      formErrors.push(error);
    }

    if (!montant.annee_ma) {
      const error = {
        name: this.namesMap.annee_ma.code,
        message: 'Une année d \'affectation doit être définie.'
      };
      formErrors.push(error);
    }
  }

  /**
   * Un montant affecté a été créé et initialisé dans le tableau.
   * @param event : encapsule le montant affecté à modifier.
   */
  async onCreate(event: GenericTableEntityEvent<MontantAffecte>): Promise<void> {
    try {
      let montant = event.entity;
      if (!montant) {
        throw new Error('Le montant affecté n\'existe pas');
      }

      if (this.validateForGenericTable(event)) {
        await this.montantsAffectesService.post(montant);
        await this.refreshDataTable();
        event.callBack(null); // Valide la modification dans le composant DataTable fils
      }

    } catch (error) {
      console.error(error);
      for( const err of error.error.errors){
        this.showInformation('Impossible de créer le montant affecté : ' + err.message);
      }
    }
  }

  /**
   * Supprimer un montant affecté avec confirmation avec un popup
   * @param entity
   */
  async onDelete(event: GenericTableEntityEvent<MontantAffecte>): Promise<void> {
    try {
      const montant = event?.entity;
      if (!montant) {
        throw new Error('Le montant affecté n\'existe pas');
      }
      const dialogRef = this.dialog.open(GenericDialogComponent, {
        data: <IMessage>{
          header: 'Suppression du montant affecté',
          content: 'Voulez-vous supprimer ce montant affecté de montant ' + montant.montant_ma + ' de l\'année' + montant.annee_ma + '?',
          type: 'warning',
          action: {
            name: 'Confirmer',
          }
        }
      });

      dialogRef.afterClosed().subscribe(
        async result => {
          if (result) {
            await this.montantsAffectesService.delete(montant);
            this.showInformation('Le montant affecté de montant ' + montant.montant_ma + '€, a été supprimé du projet.');
            await this.refreshDataTable();
            event.callBack(null);
          }
        }
      )

    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de supprimer le montant affecté : ' + error.message);
      event?.callBack({
        apiError: 'Impossible de supprimer le montant affecté.'
      });
    }
  }



}
