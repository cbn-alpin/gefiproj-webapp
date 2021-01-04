import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GenericTableDemoModule } from '../../generic-table-demo.module';
import { GenericTableDemoComponent } from './generic-table-demo.component';

describe('GenericTableDemoComponent', () => {
  let component: GenericTableDemoComponent;
  let fixture: ComponentFixture<GenericTableDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        GenericTableDemoModule]
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
