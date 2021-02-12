import { Financement } from 'src/app/models/financement';
/**
 * Représente une recette.
 */
export interface Recette {
  id_r?: number;
  financement?: Financement;
  montant_r: number;
  annee_r: number;
  id_f?: number;
  difference?: number;
}
