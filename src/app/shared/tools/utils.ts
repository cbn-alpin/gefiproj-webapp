import { SortInfo } from '../components/generic-table/models/sortInfo';

/**
 * Trie un tableau selon le sortInfo
 * @param array : tableau à trier.
 * @param sortInfo : infos du trie.
 */
export function basicSort(array: any[], sortInfo: SortInfo): any[] {
  if (sortInfo == null) {
    return array;
  }
  const { name, direction } = sortInfo;
  const mult =
    direction === 'asc' // Pour gérer le sens du trie
      ? 1
      : -1;
  return array.sort((p1, p2) => {
    let item1 = p1[name];
    let item2 = p2[name];

    if (typeof item1 === 'string') {
      // Pour du texte
      item1 = item1?.toUpperCase();
      item2 = item2?.toUpperCase();
    }

    if (item1 == null) {
      return 1;
    } else if (item2 == null) {
      return -1;
    } else if (item1 < item2) {
      return -1 * mult;
    } else if (item1 > item2) {
      return 1 * mult;
    } else {
      return 0;
    }
  });
}

/**
 * Retourne l'objet avec une nouvelle référence.
 * @param object
 */
export function getDeepCopy(object: any): any {
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    console.error(e);
  }
}
