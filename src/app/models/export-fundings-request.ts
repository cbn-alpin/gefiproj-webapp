import { GoogleSheetsPermission } from './google-sheets-permission';

/**
 * Paramètres de la requête de création d'un bilan de suivi des financements.
 */
export interface ExportFundingsRequest {
    version: 1 | 2;

    /**
     * Année courante, pour la v1. Année de départ de la période, pour la v2.
     */
    annee_ref: number;

    /**
     * Année de fin de période, pour la v2.
     */
    annee_max: number;

    /**
     * Défini des droits d'accès à un document Google Sheets.
     */
    partages?: GoogleSheetsPermission[];
}
