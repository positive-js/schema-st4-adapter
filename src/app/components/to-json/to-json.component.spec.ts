import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToJsonComponent } from './to-json.component';

describe('ToJsonComponent', () => {
  let component: ToJsonComponent;
  let fixture: ComponentFixture<ToJsonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToJsonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
