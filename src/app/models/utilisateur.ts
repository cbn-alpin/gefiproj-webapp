import { Role } from './role';

/**
 * Représente un utilisateur.
 */
export interface Utilisateur {
    /**
     * Identifiant technique.
     */
    id_u: number;

    nom_u: string;
    prenom_u: string;
    email_u: string;
    initiales_u: string;
    active_u: boolean;

    /**
     * Rôle principal de l'utilisateur (ex : admin).
     */
    role: Role;
}
