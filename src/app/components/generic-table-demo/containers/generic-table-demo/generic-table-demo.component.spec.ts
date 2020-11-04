import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericTableDemoComponent } from './generic-table-demo.component';
import {GenericTableDemoModule} from '../../generic-table-demo.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('GenericTableDemoComponent', () => {
  let component: GenericTableDemoComponent;
  let fixture: ComponentFixture<GenericTableDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ GenericTableDemoModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericTableDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
