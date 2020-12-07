import { Financeur } from './financeur';

export interface Financement {
  id_f?: number;
  id_p: number;
  id_financeur?: number;
  financeur?: String;
  montant_arrete_f: number;
  date_arrete_f?: Date | string;
  date_limite_solde_f?: Date | string;
  statut_f: Statut_F;
  date_solde_f: Date | string;
  commentaire_admin_f?: string;
  commentaire_resp_f?: string;
  numero_titre_f?: string;
  annee_titre_f?: number | string;
  imputation_f?: string;
  difference?: number;
}

export enum Statut_F {
  ANTR = 'ANTR',
  ATR = 'ATR',
  SOLDE = 'SOLDE'
}
