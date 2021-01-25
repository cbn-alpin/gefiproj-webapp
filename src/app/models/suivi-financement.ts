import { Projet } from './projet';
import { Financeur } from './financeur';
import { Utilisateur } from './utilisateur';
import { Financement, Statut_F } from './financement';

export interface SuiviFinancementDto {
  projet: Projet;
  financement: Financement;
  recettes: RecettesSuiviFinancement;
  a?: number;
  b?: string;
}

interface RecettesSuiviFinancement {
  recettes_avant_annee_1: number;
  recettes_annee_1: number;
  recettes_annee_2: number;
  recettes_annee_3: number;
  recettes_annee_4: number;
  recettes_apres_annee_4: number;
}

export interface SuiviFinancement {
  code_p: string;
  nom_p: string;
  nom_financeur: string;
  initiales_u: string;
  date_arrete_f: Date | string;
  date_limite_solde_f: Date | string;
  montant_arrete_f: number;
  recettes_avant_annee_1: number;
  recettes_annee_1: number;
  recettes_annee_2: number;
  recettes_annee_3: number;
  recettes_annee_4: number;
  recettes_apres_annee_4: number;
  commentaire: string;
  numero_titre_f: string;
  imputation: string;
  statut_f: Statut_F;
}
