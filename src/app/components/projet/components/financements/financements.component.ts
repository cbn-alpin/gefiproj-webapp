import {DatePipe} from '@angular/common';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {Financement, Statut_F} from 'src/app/models/financement';
import {Financeur} from 'src/app/models/financeur';
import {FinancementsService} from 'src/app/services/financements.service';
import {FinanceurService} from 'src/app/services/financeur.service';
import {SpinnerService} from 'src/app/services/spinner.service';
import {GenericTableCellType} from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import {GenericTableEntityEvent} from 'src/app/shared/components/generic-table/models/generic-table-entity-event';
import {GenericTableInterface} from 'src/app/shared/components/generic-table/models/generic-table-interface';
import {GenericTableOptions} from 'src/app/shared/components/generic-table/models/generic-table-options';

@Component({
  selector: 'app-financements',
  templateUrl: './financements.component.html',
  styleUrls: ['./financements.component.scss']
})
export class FinancementsComponent implements OnInit, GenericTableInterface<Financement>  {

  /**
   * id projet
   */
  @Input() projectId: number;

  /**
   *
   */
  @Output() selectEvent: EventEmitter<Financement> = new EventEmitter<Financement>();

  /**
   * Titre du tableau générique
   */
  readonly title = 'Financements';

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
  private readonly defaultEntity: Financement= {
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
   * Paramètres du tableau de financement.
   */
  options: GenericTableOptions<Financement> = {
    dataSource: [],
    defaultEntity: this.defaultEntity,
    entityTypes: [
      {name: 'Montant Arreté', type: GenericTableCellType.CURRENCY, code: Object.keys(this.defaultEntity)[3]},
      {name: 'Date arreté ou commande', type: GenericTableCellType.DATE, code: Object.keys(this.defaultEntity)[4]},
      {name: 'Date limite de solde', type: GenericTableCellType.DATE, code: Object.keys(this.defaultEntity)[5]},
      {name: 'Financeur', type: GenericTableCellType.SELECTBOX, code: Object.keys(this.defaultEntity)[14]},
      {name: 'Statut', type: GenericTableCellType.SELECTBOX, code: Object.keys(this.defaultEntity)[6]},
      {name: 'Date de solde', type: GenericTableCellType.DATE, code: Object.keys(this.defaultEntity)[7]},
      {name: 'Commentaire admin', type: GenericTableCellType.TEXTAREA, code: Object.keys(this.defaultEntity)[8]},
      {name: 'Commentaire responsable', type: GenericTableCellType.TEXTAREA, code: Object.keys(this.defaultEntity)[9]},
      {name: 'Numéro titre', type: GenericTableCellType.TEXT, code: Object.keys(this.defaultEntity)[10]},
      {name: 'Année titre', type: GenericTableCellType.TEXT, code: Object.keys(this.defaultEntity)[11]},
      {name: 'Imputation', type: GenericTableCellType.TEXT, code: Object.keys(this.defaultEntity)[12]},
      {name: 'Différence', type: GenericTableCellType.CURRENCY, code: Object.keys(this.defaultEntity)[13]}
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: []
  };

  /**
   * Liste de statut
   */
  private statuts_financement = [
    {code:'ANTR', value: Statut_F.ANTR},
    {code:'ATR', value: Statut_F.ATR},
    {code:'SOLDE', value: Statut_F.SOLDE},
  ]

  constructor(
    private financementsService: FinancementsService,
    private financeurService: FinanceurService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private spinnerSrv: SpinnerService
  ) {
    // this.projectId = this.route.snapshot.params.id;
    // if(!this.projectId) this.router.navigate(['home'])
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.loadFinancements(Number(this.projectId));
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Charge les financements depuis le serveur.
   */
  async loadFinancements(projetId: number): Promise<Financement[]> {
    try {
      this.spinnerSrv.show();
      this.financements = await this.financementsService.getAll(projetId);
      this.financeurs = await this.financeurService.getAll();
      const entitySelectBoxOptions = [
        {
          name: Object.keys(this.defaultEntity)[14],
          values: [...this.financeurs]
        },
        {
          name: Object.keys(this.defaultEntity)[6],
          values: [...this.statuts_financement]
        }
      ];
      this.options.entitySelectBoxOptions = entitySelectBoxOptions;
      this.options = Object.assign({}, this.options, {
        dataSource: this.financements
      });
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de charger les financements : ' + error);
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
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

  /**
   * Un financement a été modifié dans le tableau.
   * @param event : encapsule le financement à modifier.
   */
  async onEdit(event: GenericTableEntityEvent<Financement>): Promise<void> {
    try {
      let financement = event.entity;
      if(financement.hasOwnProperty('difference')) delete financement.difference;
      if(!financement.hasOwnProperty('id_p')) financement.id_p = Number(this.projectId);
      // recuperer l'id financeur
      const financeur = this.financeurs.find(res => res.nom_financeur === financement.financeur);
      financement.id_financeur = financeur.id_financeur;
      delete financement.financeur;
      // recuperer la valuer statut
      const statut_f = this.statuts_financement.find(res => res.value === financement.statut_f);
      financement.statut_f = statut_f.value;

      const pipe = new DatePipe('fr-FR');
      if(financement.date_arrete_f) financement.date_arrete_f = pipe.transform(new Date(financement.date_arrete_f), 'yyyy-MM-dd')
      if(financement.date_limite_solde_f) financement.date_limite_solde_f = pipe.transform(new Date(financement.date_limite_solde_f), 'yyyy-MM-dd')
      if(financement.date_solde_f) financement.date_solde_f = pipe.transform(new Date(financement.date_solde_f), 'yyyy-MM-dd')

      await this.financementsService.put(financement);
      await this.loadFinancements(Number(this.projectId));
      event.callBack(null);
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de charger les financements : ' + error);
    }
  }

  /**
  * Un financements a été créé et initialisé dans le tableau.
  * @param event : encapsule le financements à modifier.
  */
  async onCreate(event: GenericTableEntityEvent<Financement>): Promise<void> {
    try {
      let financement = event.entity;
      if(financement.hasOwnProperty('difference')) delete financement.difference;
      if(!financement.hasOwnProperty('id_p')) financement.id_p = Number(this.projectId);
      const financeur = this.financeurs.find(res => res.nom_financeur === financement.financeur);
      financement.id_financeur = financeur.id_financeur;
      delete financement.financeur;

      const pipe = new DatePipe('fr-FR');
      if(financement.date_arrete_f) financement.date_arrete_f = pipe.transform(new Date(financement.date_arrete_f), 'yyyy-MM-dd')
      if(financement.date_limite_solde_f) financement.date_limite_solde_f = pipe.transform(new Date(financement.date_limite_solde_f), 'yyyy-MM-dd')
      if(financement.date_solde_f) financement.date_solde_f = pipe.transform(new Date(financement.date_solde_f), 'yyyy-MM-dd')

      await this.financementsService.post(event.entity);
      await this.loadFinancements(Number(this.projectId));
      event.callBack(null);
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de créer un financement : ' + error);
    }
  }

  /**
   * Un financements a été supprimé du tableau.
   * @param event : encapsule le financements à modifier.
   */
  async onDelete(event: GenericTableEntityEvent<Financement>): Promise<void> {
    try {
      await this.financementsService.delete(event.entity);
      event.callBack(null);
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de supprimer le financements.'
      });
    }
  }

  /**
   * Émission du financement séléctionné au parent
   * @param event
   */
  public onSelect(event: GenericTableEntityEvent<Financement>): void {
    this.selectEvent.emit(event.entity);
  }
}
