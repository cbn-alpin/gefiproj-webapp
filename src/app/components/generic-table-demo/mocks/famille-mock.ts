import {Famille} from '../models/famille';
import {FamilleOrigine} from '../globals/famille-origine';

export const familleMock: Famille[] = [
  {
    dateCreation: new Date(),
    existante: true,
    membres: 10,
    origine: FamilleOrigine.ASIE
  },
  {
    dateCreation: new Date(),
    existante: false,
    membres: 3,
    origine: FamilleOrigine.EUROPE
  },
  {
    dateCreation: new Date(),
    existante: false,
    membres: 5,
    origine: FamilleOrigine.AMERICAINE
  }
]
