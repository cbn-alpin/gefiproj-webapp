import { Component, OnInit } from '@angular/core';
import {Financement} from "../../models/financement";
import {ProjetService} from "../../services/projet.service";
import {Recette} from "../../models/recette";

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

  ngOnInit(): void {
  }

  public async getRecettesFromFinancemennt(financement: Financement): Promise<void> {
    this.recettes = await this._projetService.getAllRecettesFromFinancement(financement);
  }

  public onSelectFinancement(financement: Financement): void {
    this.selectedFinancement = financement;
    this.getRecettesFromFinancemennt(financement);
  }

}
