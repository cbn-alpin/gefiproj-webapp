import { Recette } from './recette';
/**
 * Représente un montant affecté.
 */
export interface MontantAffecte {
  id_ma?: number;
  recette?: Recette;
  id_r?: number;
  montant_ma: number;
  annee_ma: string;
}
