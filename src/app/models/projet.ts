export interface Projet {
  id: number;
  code: number;
  nom: string;

  /**
   * Initiales du responsable.
   */
  responsable: string;

  /**
   * Indique si le projet est soldé (true ssi soldé).
   */
  statut: boolean;
}
