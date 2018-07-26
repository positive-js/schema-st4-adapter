import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffsContentComponent } from './diffs-content.component';

describe('DiffsContentComponent', () => {
  let component: DiffsContentComponent;
  let fixture: ComponentFixture<DiffsContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiffsContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
