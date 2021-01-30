import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConnexionComponent } from 'src/app/components/connexion/connexion.component';
import { HomeComponent } from 'src/app/components/home/home.component';
import { GenericTableDemoModule } from '../../generic-table-demo.module';
import { FamilleTableComponent } from './famille-table.component';

describe('FamilleTableComponent', () => {
  let component: FamilleTableComponent;
  let fixture: ComponentFixture<FamilleTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'connexion', component: ConnexionComponent},
          {path: 'home', component: HomeComponent}]
        ),
        GenericTableDemoModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
