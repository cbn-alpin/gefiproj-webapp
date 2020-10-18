import { Role } from './role';

/**
 * Représente un utilisateur.
 */
export interface Utilisateur {
    /**
     * Identifiant technique.
     */
    id: number;

    nom: string;
    prenom: string;
    mail: string;
    initiales: string;

    /**
     * Rôle principal de l'utilisateur (ex : admin).
     */
    role: Role;
}
