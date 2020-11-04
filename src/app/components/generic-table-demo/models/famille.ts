import {FamilleOrigine} from '../globals/famille-origine';

export interface Famille {
  membres: number;
  dateCreation: Date;
  existante: boolean;
  origine: FamilleOrigine;
}
