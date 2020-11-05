import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetFinancementsComponent } from './projet-financements.component';

describe('ProjetFinancementsComponent', () => {
  let component: ProjetFinancementsComponent;
  let fixture: ComponentFixture<ProjetFinancementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjetFinancementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetFinancementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
