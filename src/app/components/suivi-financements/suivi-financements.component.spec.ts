import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuiviFinancementsComponent } from './suivi-financements.component';

describe('SuiviFinancementsComponent', () => {
  let component: SuiviFinancementsComponent;
  let fixture: ComponentFixture<SuiviFinancementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuiviFinancementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuiviFinancementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
