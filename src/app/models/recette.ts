import { Financement } from 'src/app/models/financement';

export interface Recette {
  id_r: number;
  financement: Financement;
  montant_r: number;
  annee_r: string;
}
