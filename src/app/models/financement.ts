export interface Financement {
  code: string;
  code_projet: number;
  montant_arrete: number;
  date_arrete?: Date | string;
  date_limite_solde?: Date | string;
  financeur: string;
  statut: string;
  date_solde: Date | string;
  commentaire?: string;
  numero_titre?: string;
  annee_titre?: number | string;
  imputation?: string;
}
