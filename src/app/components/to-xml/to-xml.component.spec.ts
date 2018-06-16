import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToXmlComponent } from './to-xml.component';

describe('ToXmlComponent', () => {
  let component: ToXmlComponent;
  let fixture: ComponentFixture<ToXmlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToXmlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToXmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
