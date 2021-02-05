import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntreesSortiesComponent } from './entrees-sorties.component';

describe('EntreesSortiesComponent', () => {
  let component: EntreesSortiesComponent;
  let fixture: ComponentFixture<EntreesSortiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntreesSortiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntreesSortiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
