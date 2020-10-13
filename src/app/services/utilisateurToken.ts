import { Utilisateur } from '../models/utilisateur';

/**
 * Représente un utilisateur authentifié et fournit son Token de connexion.
 */
export interface UtilisateurToken extends Utilisateur {
    /**
     * Token de connexion fourni par le serveur.
     */
    access_token: string;

    /**
     * Token de reconnexion fourni par le serveur.
     */
    refresh_token?: string;
}
