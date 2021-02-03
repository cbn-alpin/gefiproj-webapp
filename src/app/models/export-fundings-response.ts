/**
 * Encapsule la réponse du serveur suite à la création d'un bilan au format Google Sheets.
 */
export interface ExportFundingsResponse {
    message: string;
    version: string;
    title: string;

    /**
     * URL à utiliser pour ouvrir le document.
     */
    url: string;

    shares: any;
    lines: number;
}
