import { Component, OnInit } from '@angular/core';
import {ProjetService} from "../../services/projet.service";
import {Recette} from "../../../../models/recette";

@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.component.scss']
})
export class ProjetComponent implements OnInit {

  public recettes: Recette[];

  constructor(
    private projetService: ProjetService
  ) { }

  ngOnInit(): void {
  }

  public async getRecettesFromFinancement(idFinancement: string): Promise<Recette[]> {
    this.recettes = await this.projetService.getRecettesFromFinancement(idFinancement);
    return this.recettes;
  }


}
