/* tslint:disable:no-unused-variable */
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Projet } from '../models/projet';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

describe('Service: Crud', () => {
  let service: CrudService<Projet>;
  let httpTestingController: HttpTestingController;
  const url = 'api/test';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: []
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = new CrudService<Projet>(
      TestBed.inject(HttpClient),
      TestBed.inject(SpinnerService),
      url
    );
  });

  it('should ...', () => {
    expect(service).toBeTruthy();
  });

  it('getAll', async () => {
    const projects = [];

    var promiseProjects = service.getAll(); // Action

    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('GET');
    req.flush(projects);

    await promiseProjects;
    httpTestingController.verify();
  });

  it('getAll, retour à null', async () => {
    const projects = null;

    var promiseProjects = service.getAll(); // Action

    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('GET');
    req.flush(projects);

    const result = await promiseProjects;
    expect(result).not.toBeNull();
    httpTestingController.verify();
  });

  it('getAll, erreur serveur', async () => {
    const status = 400;
    const statusText = 'rien';

    try {
      const message = '!';

      var promiseProjects = service.getAll(); // Action

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.error(new ErrorEvent(message), { status, statusText });

      await promiseProjects;
    } catch (error) {
      expect(error.status).toBe(status);
      expect(error.statusText).toBe(statusText);
    }
    finally {
      httpTestingController.verify();
    }
  });

  it('get', async () => {
    const project = {} as Projet;
    const id = 5;

    var promiseProjects = service.get(id); // Action

    const req = httpTestingController.expectOne(url + '/' + id);
    expect(req.request.method).toEqual('GET');
    req.flush(project);

    await promiseProjects;
    httpTestingController.verify();
  });

  it('get, erreur id', async () => {
    try {
      await service.get(null); // Action
    } catch (error) {
      expect().nothing();
    }
    finally {
      httpTestingController.verify();
    }
  });

  it('get, erreur serveur', async () => {
    const status = 400;
    const statusText = 'rien';

    try {
      const message = '!';
      const id = 5;

      var promiseProjects = service.get(id); // Action

      const req = httpTestingController.expectOne(url + '/' + id);
      expect(req.request.method).toEqual('GET');
      req.error(new ErrorEvent(message), { status, statusText });

      await promiseProjects;
    } catch (error) {
      expect(error.status).toBe(status);
      expect(error.statusText).toBe(statusText);
    }
    finally {
      httpTestingController.verify();
    }
  });

  it('delete', async () => {
    const id = 5;

    var promiseProjects = service.delete(id); // Action

    const req = httpTestingController.expectOne(url + '/' + id);
    expect(req.request.method).toEqual('DELETE');
    req.flush(null);

    await promiseProjects;
    httpTestingController.verify();
  });

  it('delete, erreur id', async () => {
    try {
      await service.delete(null); // Action
    } catch (error) {
      expect().nothing();
    }
    finally {
      httpTestingController.verify();
    }
  });

  it('delete, erreur serveur', async () => {
    const status = 400;
    const statusText = 'rien';

    try {
      const message = '!';
      const id = 5;

      var promiseProjects = service.delete(id); // Action

      const req = httpTestingController.expectOne(url + '/' + id);
      expect(req.request.method).toEqual('DELETE');
      req.error(new ErrorEvent(message), { status, statusText });

      await promiseProjects;
    } catch (error) {
      expect(error.status).toBe(status);
      expect(error.statusText).toBe(statusText);
    }
    finally {
      httpTestingController.verify();
    }
  });

  it('modify', async () => {
    const project = { id_p: 5 } as Projet;

    var promiseProjects = service.modify(project, project.id_p); // Action

    const req = httpTestingController.expectOne(url + '/' + project.id_p);
    expect(req.request.method).toEqual('PUT');
    req.flush(project);

    await promiseProjects;
    httpTestingController.verify();
  });

  it('modify, erreur id', async () => {
    try {
      const project = {} as Projet;

      await service.modify(project, null); // Action
    } catch (error) {
      expect().nothing();
    }
    finally {
      httpTestingController.verify();
    }
  });

  it('modify, erreur serveur', async () => {
    const status = 400;
    const statusText = 'rien';

    try {
      const message = '!';
      const project = { id_p: 5 } as Projet;

      var promiseProjects = service.modify(project, project.id_p); // Action

      const req = httpTestingController.expectOne(url + '/' + project.id_p);
      expect(req.request.method).toEqual('PUT');
      req.error(new ErrorEvent(message), { status, statusText });

      await promiseProjects;
    } catch (error) {
      expect(error.status).toBe(status);
      expect(error.statusText).toBe(statusText);
    }
    finally {
      httpTestingController.verify();
    }
  });

  it('add', async () => {
    let project = {} as Projet;

    var promiseProjects = service.add(project); // Action

    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('POST');
    project = { id_p: 5 } as Projet;
    req.flush(project);

    const result = await promiseProjects;
    expect(result.id_p).toBe(project.id_p);
    httpTestingController.verify();
  });

  it('add, erreur serveur', async () => {
    const status = 400;
    const statusText = 'rien';

    try {
      const message = '!';
      const project = { id_p: 5 } as Projet;

      var promiseProjects = service.add(project); // Action

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      req.error(new ErrorEvent(message), { status, statusText });

      await promiseProjects;
    } catch (error) {
      expect(error.status).toBe(status);
      expect(error.statusText).toBe(statusText);
    }
    finally {
      httpTestingController.verify();
    }
  });
});
