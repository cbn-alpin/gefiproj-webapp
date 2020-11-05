import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetDetailsComponent } from './projet-details.component';

describe('ProjetDetailsComponent', () => {
  let component: ProjetDetailsComponent;
  let fixture: ComponentFixture<ProjetDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjetDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
