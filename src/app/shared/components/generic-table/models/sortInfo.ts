import { SortDirection } from '@angular/material/sort';

/**
 * Indique le trie courant.
 */
export interface SortInfo {
    /**
     * Propriété triée.
     */
    name: string;

    /**
     * Sens du trie.
     */
    direction: SortDirection;
}
