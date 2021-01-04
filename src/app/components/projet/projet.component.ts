import { Component, OnInit } from '@angular/core';
import {Financement} from "../../models/financement";
import {ProjetService} from "../../services/projet.service";
import {Recette} from "../../models/recette";
import {IsAdministratorGuardService} from '../../services/authentication/is-administrator-guard.service';
import {FinancementsService} from '../../services/financements.service';
import {FinanceurService} from '../../services/financeur.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ProjetsService} from '../../services/projets.service';
import {Financement} from '../../models/financement';
import {Projet} from '../../models/projet';
import {Utilisateur} from '../../models/utilisateur';

@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.scss']
})
export class ProjetComponent implements OnInit {
  public recettes: Recette[];
  public selectedFinancement: Financement;

  constructor(
    private readonly _projetService: ProjetService
  ) { }
  /**
   * id projet
   */
  public projectId: string;
  /**
   * projet
   */
  public projet: Projet ;
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
   * @param ProjetService : permet de dialoguer avec le serveur d'API pour les entités projet.
   * @param route
   * @param router
   * @param snackBar : affiche une information.
   */
  constructor(
    private adminSrv: IsAdministratorGuardService,
    private projetService: ProjetsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.projectId = this.route.snapshot.params.id;
    if (!this.projectId) { this.router.navigate(['home']) }
  }

  public async getRecettesFromFinancemennt(financement: Financement): Promise<void> {
    this.recettes = await this._projetService.getAllRecettesFromFinancement(financement);
  }

  public onSelectFinancement(financement: Financement): void {
    this.selectedFinancement = financement;
    this.getRecettesFromFinancemennt(financement);
  }

  async ngOnInit(): Promise<void> {
    try {
    await this.loadProjet(Number(this.projectId));
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Charge le projet depuis le serveur.
   */
  async loadProjet(projetId: number): Promise<Projet> {
    try {
      this.projet = (await this.projetService.get(projetId)) ;
    } catch (error) {
      console.error(error);
      this.showInformation('Impossible de charger le projet : ' + error.error);
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

}
