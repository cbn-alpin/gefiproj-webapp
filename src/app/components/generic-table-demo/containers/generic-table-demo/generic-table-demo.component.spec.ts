import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from 'src/app/components/connexion/connexion.component';
import { HomeComponent } from 'src/app/components/home/home.component';
import { GenericTableDemoModule } from '../../generic-table-demo.module';
import { GenericTableDemoComponent } from './generic-table-demo.component';

describe('GenericTableDemoComponent', () => {
  let component: GenericTableDemoComponent;
  let fixture: ComponentFixture<GenericTableDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        ),
        GenericTableDemoModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericTableDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
