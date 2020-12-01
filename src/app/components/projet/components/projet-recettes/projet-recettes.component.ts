import {Component, Input, OnInit} from '@angular/core';
import {Recette} from "../../../../models/recette";
import {GenericTableOptions} from "../../../../shared/components/generic-table/models/generic-table-options";
import {EntityType} from "../../../../shared/components/generic-table/models/entity-types";
import {GenericTableCellType} from "../../../../shared/components/generic-table/globals/generic-table-cell-types";
import {EntityPlaceholder} from "../../../../shared/components/generic-table/models/entity-placeholder";

@Component({
  selector: 'app-projet-recettes',
  templateUrl: './projet-recettes.component.html',
  styleUrls: ['./projet-recettes.component.scss']
})
export class ProjetRecettesComponent implements OnInit {
  /**
   * Recettes du financement sélectionné
   * @private
   */
  @Input() public recettes: Recette[];

  /**
   * Titre du tableau générique
   */
  public title = 'Recettes';

  /**
   * Options du tableau générique: données sources, entité par défaut, types des entités, les options des select box, les placeholders
   */
  public options: GenericTableOptions<Recette>;


  /**
   * Entité par défaut utilisé lors de la création d'une nouvelle recette
   * @private
   */
  private defaultEntity: Recette = {
    annee_recette: "2020",
    montant: undefined
  };

  /**
   * Extraire les noms de chaque propriétés du type Famille vers une énumération.
   * Cette énumération nous facilite la vie.
   * Attention: le nom de la propriété dans l'énum doit correspondre au nom de la propriété du type
   * -> Ex: ORIGINE: 'origine' mais pas 'Origine'
   * -> C'est pour cette raison qu'on extrait directement le nom de l'objet grâce à Object.keys
   * TODO: Trouver une meilleur solution
   * @private
   */
  private EntityPropertyName = {
    ANNEE_RECETTE: Object.keys(this.defaultEntity)[0],
    MONTANT: Object.keys(this.defaultEntity)[1]
  };

  /**
   * Tableau des types de l'entité recette
   * @private
   */
  private entityTypes: EntityType[] = [
    {name: this.EntityPropertyName.ANNEE_RECETTE, type: GenericTableCellType.TEXT},
    {name: this.EntityPropertyName.MONTANT, type: GenericTableCellType.NUMBER}
  ];

  /**
   * Tableau des placeholders de l'entité famille
   * @private
   */
  private entityPlaceHolders: EntityPlaceholder[] = [
    {name: this.EntityPropertyName.ANNEE_RECETTE, value: '2019'},
    {name: this.EntityPropertyName.MONTANT, value: '152 201 #'}
  ];

  constructor() { }

  ngOnInit(): void {
    this.options = {
      dataSource: this.recettes,
      defaultEntity: this.defaultEntity,
      entitySelectBoxOptions: [],
      entityTypes: this.entityTypes,
      entityPlaceHolders: this.entityPlaceHolders
    };
  }
}
