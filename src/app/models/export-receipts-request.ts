import { GoogleSheetsPermission } from "./google-sheets-permission";

/**
 * Paramètres de la requête de création d'un bilan financier.
 */
export interface ExportReceiptsRequest {
    /**
     * Année courante.
     */
    annee_ref: number;

    /**
     * Défini des droits d'accès à un document Google Sheets.
     */
    partages?: GoogleSheetsPermission[];
}
