import { Utilisateur } from './utilisateur';
import { SortInfo } from '../shared/components/generic-table/models/sortInfo';
import { GenericTableEntityErrors } from '../shared/components/generic-table/models/generic-table-entity';

export interface Projet {
  id_p: number;

  /**
   * Code du projet : 5 chiffres, dont les 2ers représentent une année.
   */
  code_p: number;

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

export interface DefaultSortInfo {
  sortInfo: SortInfo;
  headerName: string;
}

export interface ProjetCallback {
  cb: () => any;
  id: number;
}
