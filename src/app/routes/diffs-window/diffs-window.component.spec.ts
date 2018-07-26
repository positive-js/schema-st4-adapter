import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffsWindowComponent } from './diffs-window.component';

describe('DiffsWindowComponent', () => {
  let component: DiffsWindowComponent;
  let fixture: ComponentFixture<DiffsWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiffsWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffsWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
