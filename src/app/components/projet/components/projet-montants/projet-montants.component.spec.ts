import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetMontantsComponent } from './projet-montants.component';

describe('ProjetMontantsComponent', () => {
  let component: ProjetMontantsComponent;
  let fixture: ComponentFixture<ProjetMontantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjetMontantsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetMontantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
