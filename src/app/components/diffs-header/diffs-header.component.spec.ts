import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffsHeaderComponent } from './diffs-header.component';

describe('DiffsHeaderComponent', () => {
  let component: DiffsHeaderComponent;
  let fixture: ComponentFixture<DiffsHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiffsHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
