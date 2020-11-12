export interface Projet {
  id_p: number;
  code_p: number;
  nom_p: string;

  /**
   * Initiales du responsable.
   */
  responsable?: string;

  /**
   * Indique si le projet est soldé (true ssi soldé).
   */
  statut_p: boolean;
}
