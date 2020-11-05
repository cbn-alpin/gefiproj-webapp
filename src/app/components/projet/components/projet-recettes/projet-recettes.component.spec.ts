import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetRecettesComponent } from './projet-recettes.component';

describe('ProjetRecettesComponent', () => {
  let component: ProjetRecettesComponent;
  let fixture: ComponentFixture<ProjetRecettesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjetRecettesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetRecettesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
