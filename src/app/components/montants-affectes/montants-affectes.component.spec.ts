import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MontantsAffectesComponent } from './montants-affectes.component';

describe('MontantsAffectesComponent', () => {
  let component: MontantsAffectesComponent;
  let fixture: ComponentFixture<MontantsAffectesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MontantsAffectesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MontantsAffectesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
