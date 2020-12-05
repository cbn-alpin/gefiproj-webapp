import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancementsComponent } from './financements.component';

describe('FinancementsComponent', () => {
  let component: FinancementsComponent;
  let fixture: ComponentFixture<FinancementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinancementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
