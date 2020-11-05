import {FamilleOrigine} from '../globals/famille-origine';

export interface Famille {
  membres: number;
  date_creation: Date;
  existante: boolean;
  origine: FamilleOrigine;
  montant_tresorerie: number;
}
