import { ComponentFixture, TestBed } from '@angular/core/testing';
import {GenericTableComponent} from './generic-table.component';
import {SharedModule} from '../../../../shared.module';
import {mockGenericTable} from '../../mock/mockGenericTable';


describe('GenericTableComponent', () => {
  let component: GenericTableComponent<any>;
  let fixture: ComponentFixture<GenericTableComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericTableComponent);
    component = fixture.componentInstance;
    const dataSource = mockGenericTable;
    component.options = {
      dataSource,
      entityPlaceHolders: [],
      defaultEntity: {},
      entitySelectBoxOptions: [],
      entityTypes: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
