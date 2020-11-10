import { Component, OnInit } from '@angular/core';
import { Financement, Statut_F } from 'src/app/models/financement';
import { GenericTableCellType } from 'src/app/shared/components/generic-table/globals/generic-table-cell-types';
import { GenericTableInterface } from 'src/app/shared/components/generic-table/models/generic-table-interface';
import { GenericTableOptions } from 'src/app/shared/components/generic-table/models/generic-table-options';
import { EntitySelectBoxOptions } from 'src/app/shared/components/generic-table/models/entity-select-box-options';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenericTableEntityEvent } from 'src/app/shared/components/generic-table/models/generic-table-entity-event';
import { FinancementsService } from 'src/app/services/financements.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-projets',
  templateUrl: './projets.component.html',
  styleUrls: ['./projets.component.scss']
})
export class ProjetsComponent implements OnInit, GenericTableInterface<Financement>  {

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
    commentaire_admin_f: '',
    commentaire_resp_f: '',
    numero_titre_f: '',
    annee_titre_f: '',
    imputation_f: '',
    difference: 0,
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
      {name: 'Financeur', type: GenericTableCellType.SELECTBOX, code: Object.keys(this.defaultEntity)[2]},
      {name: 'Statut', type: GenericTableCellType.SELECTBOX, code: Object.keys(this.defaultEntity)[6]},
      {name: 'Date de solde', type: GenericTableCellType.DATE, code: Object.keys(this.defaultEntity)[7]},
      {name: 'Commentaire admin', type: GenericTableCellType.TEXT, code: Object.keys(this.defaultEntity)[8]},
      {name: 'Commentaire responsable', type: GenericTableCellType.TEXT, code: Object.keys(this.defaultEntity)[9]},
      {name: 'Numéro titre', type: GenericTableCellType.TEXT, code: Object.keys(this.defaultEntity)[10]},
      {name: 'Année titre', type: GenericTableCellType.TEXT, code: Object.keys(this.defaultEntity)[11]},
      {name: 'Imputation', type: GenericTableCellType.TEXT, code: Object.keys(this.defaultEntity)[12]},
      {name: 'Différence', type: GenericTableCellType.CURRENCY, code: Object.keys(this.defaultEntity)[13]}
    ],
    entityPlaceHolders: [],
    entitySelectBoxOptions: []
  };
  
  /**
   * Tableau des options des select box de l'entité financement
   * @private
   */
  private entitySelectBoxOptions: EntitySelectBoxOptions[] = [
    {
      name: Object.keys(this.defaultEntity)[2],
      values: [
        {code: 1, value: 1},
      ]
    },
    {
      name: Object.keys(this.defaultEntity)[6],
      values: [
        {code:'ANTR', value: Statut_F.ANTR},
        {code:'ATR', value: Statut_F.ATR},
        {code:'SOLDE', value: Statut_F.SOLDE},
      ]
    }
  ];



  constructor(
    private financementsService: FinancementsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.projectId = this.route.snapshot.params.id;
    if(!this.projectId) this.router.navigate(['home'])
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.loadFinancements(this.projectId);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Charge les financements depuis le serveur.
   */
  async loadFinancements(projetId: string): Promise<Financement[]> {
    try {
      this.financements = await this.financementsService.get_by_id(projetId);
      this.financements.forEach( res => {
        res.difference = 0;
      });

    console.log(this.financements)
      this.options.dataSource = this.financements.reverse();
      this.options.entitySelectBoxOptions = this.entitySelectBoxOptions;
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de charger les projets.');
      return Promise.reject(error);
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
      financement.id_p = Number(this.projectId);
      const pipe = new DatePipe('fr-FR');

      if(financement.date_arrete_f) financement.date_arrete_f = pipe.transform(new Date(financement.date_arrete_f), 'yyyy-MM-dd')
      if(financement.date_limite_solde_f) financement.date_limite_solde_f = pipe.transform(new Date(financement.date_limite_solde_f), 'yyyy-MM-dd')
      if(financement.date_solde_f) financement.date_solde_f = pipe.transform(new Date(financement.date_solde_f), 'yyyy-MM-dd')
      console.log(financement)
      await this.financementsService.put(financement);
      //event.callBack(null);
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de modifier le financement.'
      });
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
      financement.id_p = Number(this.projectId);
      const pipe = new DatePipe('fr-FR');
      
      if(financement.date_arrete_f) financement.date_arrete_f = pipe.transform(new Date(financement.date_arrete_f), 'yyyy-MM-dd')
      if(financement.date_limite_solde_f) financement.date_limite_solde_f = pipe.transform(new Date(financement.date_limite_solde_f), 'yyyy-MM-dd')
      if(financement.date_solde_f) financement.date_solde_f = pipe.transform(new Date(financement.date_solde_f), 'yyyy-MM-dd')
      await this.financementsService.post(event.entity);
      //event.callBack(null);
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de créer le financements.'
      });
    }
  }

  /**
   * Un financements a été supprimé du tableau.
   * @param event : encapsule le financements à modifier.
   */
  async onDelete(event: GenericTableEntityEvent<Financement>): Promise<void> {
    try {
      await this.financementsService.delete(event.entity);
      //event.callBack(null);
    } catch (error) {
      console.error(error);
      event?.callBack({
        apiError: 'Impossible de supprimer le financements.'
      });
    }
  }
}
