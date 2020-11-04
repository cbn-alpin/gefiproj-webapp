import { Injectable } from '@angular/core';
import {FamilleResponseDummy} from '../models/famille-response-dummy';
import {Famille} from '../models/famille';

@Injectable({
  providedIn: 'root'
})
export class GenericTableDemoService {

  constructor() { }

  public createFamille(famille: Famille): FamilleResponseDummy {
    // call http...

    return {
      status: 200,
      statusText: 'OK'
    };
  }

  public editFamille(famille: Famille): FamilleResponseDummy {
    // call http...

    return {
      status: 200,
      statusText: 'OK'
    };
  }

  public deleteEFamille(famille: Famille): FamilleResponseDummy {
    // call http...

    return {
      status: 200,
      statusText: 'OK'
    };
  }
}
