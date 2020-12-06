import { Financement } from 'src/app/models/financement';

export interface Recette {
  id_r?: number;
  financement?: Financement;
  montant_r: number;
  annee_r: number;
  id_f?: number;
  // TODO: À SUPPRIMER QUAND JSON-SERVER NE SERA PLUS UTILISÉ
  fundingId?: number;
}
