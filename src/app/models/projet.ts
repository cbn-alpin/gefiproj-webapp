import { Utilisateur } from './utilisateur';
export interface Projet {
  id_p: number;
  code_p: number;
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
