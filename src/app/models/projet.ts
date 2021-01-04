import { Utilisateur } from './utilisateur';
export interface Projet {
  id_p: number;
  code_p: number;
  nom_p: string;

  /**
   * Responsable du projet2.
   */
  responsable?: Utilisateur;

  /**
   * Identifiant du responsable.
   */
  id_u?: number;

  /**
   * Indique si le projet2 est soldé (true ssi soldé).
   */
  statut_p: boolean;
}

export interface ProjetNavigationState {
  projectIsBalanced: boolean;
}
