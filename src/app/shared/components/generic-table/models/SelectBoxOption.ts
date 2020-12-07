/**
 * Représente une option d'un SelectBox.
 */
export interface SelectBoxOption<T> {
    /**
     * Identifiant de l'élément.
     */
    id: string | number;

    /**
     * Affichage pour l'élément.
     */
    label: string;

    /**
     * Elément encapsulé.
     */
    item?: T;
}
