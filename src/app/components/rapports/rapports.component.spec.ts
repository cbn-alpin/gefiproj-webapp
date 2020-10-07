import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportsComponent } from './rapports.component';

describe('RapportsComponent', () => {
  let component: RapportsComponent;
  let fixture: ComponentFixture<RapportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RapportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RapportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
