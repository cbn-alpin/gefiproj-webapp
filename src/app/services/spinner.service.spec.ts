import { HomeComponent } from './../components/home/home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from '../components/connexion/connexion.component';
import { SpinnerService } from './spinner.service';

describe('SpinnerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule.withRoutes(
        [{path: 'connexion', component: ConnexionComponent},
        {path: 'home', component: HomeComponent}]
      )
    ]
  }));

  it('should be created', () => {
    const service: SpinnerService = TestBed.inject(SpinnerService);
    expect(service).toBeTruthy();
  });

  it('show', () => {
    const service: SpinnerService = TestBed.inject(SpinnerService);

    service.show();
    expect(service.iterationOfShow).toBe(1);
  });

  it('hide', () => {
    const service: SpinnerService = TestBed.inject(SpinnerService);

    service.hide();
    expect(service.iterationOfShow).toBe(0);
  });

  it('show + hide', () => {
    const service: SpinnerService = TestBed.inject(SpinnerService);

    service.show();
    service.hide();
    expect(service.iterationOfShow).toBe(0);
  });

  it('show *2', () => {
    const service: SpinnerService = TestBed.inject(SpinnerService);

    service.show();
    service.show();
    expect(service.iterationOfShow).toBe(2);
  });

  it('show *2 + hide', () => {
    const service: SpinnerService = TestBed.inject(SpinnerService);

    service.show();
    service.show();
    service.hide();
    expect(service.iterationOfShow).toBe(1);
  });
});
