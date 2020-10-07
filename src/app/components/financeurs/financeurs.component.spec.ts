import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceursComponent } from './financeurs.component';

describe('FinanceursComponent', () => {
  let component: FinanceursComponent;
  let fixture: ComponentFixture<FinanceursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinanceursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
