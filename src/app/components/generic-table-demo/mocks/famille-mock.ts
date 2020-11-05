import {Famille} from '../models/famille';
import {FamilleOrigine} from '../globals/famille-origine';

export const familleMock: Famille[] = [
  {
    date_creation: new Date(),
    existante: true,
    membres: 10,
    origine: FamilleOrigine.ASIE,
    montant_tresorerie: 1452147
  },
  {
    date_creation: new Date(),
    existante: false,
    membres: 3,
    origine: FamilleOrigine.EUROPE,
    montant_tresorerie: 1452147
  },
  {
    date_creation: new Date(),
    existante: false,
    membres: 5,
    origine: FamilleOrigine.AMERICAINE,
    montant_tresorerie: 1452147
  }
]
