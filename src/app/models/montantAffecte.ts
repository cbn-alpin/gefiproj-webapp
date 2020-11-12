import { Recette } from './recette';

export interface MontantAffecte {
  id_ma: number;
  recette: Recette;
  montant_ma: number;
  annee_ma: string;
}
