import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilleTableComponent } from './famille-table.component';
import { GenericTableDemoModule } from '../../generic-table-demo.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('FamilleTableComponent', () => {
  let component: FamilleTableComponent;
  let fixture: ComponentFixture<FamilleTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
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
