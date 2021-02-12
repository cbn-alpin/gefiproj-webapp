import { Roles } from './roles';
/**
 * Représente un utilisateur.
 */
export interface Utilisateur {
    /**
     * Identifiant technique.
     */
    id_u?: number;

    nom_u: string;
    prenom_u: string;
    email_u: string;
    initiales_u: string;
    active_u: boolean;

    /**
     * Rôles de l'utilisateur (ex : admin).
     */
    roles?: Roles[];
    role?: Roles;
    password_u?: string;
    new_password?: string;
}
