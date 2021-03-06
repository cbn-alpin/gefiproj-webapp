import { Utilisateur } from '../../models/utilisateur';
import { RefreshTokenResponse } from './refreshTokenResponse';

/**
 * Représente un utilisateur authentifié et fournit son Token de connexion.
 */
export interface UserToken extends Utilisateur, RefreshTokenResponse {
}
