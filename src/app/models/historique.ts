import { Projet } from './projet';
import { Utilisateur } from './utilisateur';
/**
 * Représente une historique.
 */
export interface Historique {
    id_h?: number;
    user: Utilisateur;
    project: Projet;
    date_h: Date | string;
    description_h?: string;
}
