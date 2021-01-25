import { Utilisateur } from './utilisateur';

export interface Projet {
  id_p: number;

  /**
   * Code du projet : 5 chiffres, dont les 2ers représentent une année.
   */
  code_p: string;

  /**
   * Nom du projet.
   */
  nom_p: string;

  /**
   * Responsable du projet.
   */
  responsable?: Utilisateur;

  /**
   * Identifiant du responsable.
   */
  id_u?: number;

  /**
   * Indique si le projet est soldé (true ssi soldé).
   */
  statut_p: boolean;
}

export interface ProjetNavigationState {
  projectIsBalanced: boolean;
}
