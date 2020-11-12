import { Projet } from 'src/app/models/projet';
import { Utilisateur } from 'src/app/models/utilisateur';

export interface Historique {
    id_h: number;
    user: Utilisateur;
    project: Projet;
    date_h: Date;
    description_h: string;
}
