/**
 * Encapsule un nouveau Token.
 */
export interface RefreshTokenResponse {
    /**
     * Token d'acces.
     */
    access_token: string;

    /**
     * Token de reconnexion fourni par le serveur.
     */
    refresh_token?: string;
}
