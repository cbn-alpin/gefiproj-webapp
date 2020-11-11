/* tslint:disable:no-unused-variable */

import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, async, inject } from '@angular/core/testing';
import { Projet } from '../models/projet';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

describe('Service: Crud', () => {
  let service: CrudService<Projet>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: []
    });

    service = new CrudService<Projet>(
      TestBed.inject(HttpClient),
      TestBed.inject(SpinnerService),
      'api/test'
    );
  });

  it('should ...', () => {
    expect(service).toBeTruthy();
  });
});
