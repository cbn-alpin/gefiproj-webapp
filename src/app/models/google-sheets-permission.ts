/**
 * Défini des droits d'accès à un document Google Sheets.
 */
export interface GoogleSheetsPermission {
    email: string;
    type: string;
    permission: string;
}
