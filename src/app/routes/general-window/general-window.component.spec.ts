import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralWindowComponent } from './general-window.component';

describe('GeneralWindowComponent', () => {
  let component: GeneralWindowComponent;
  let fixture: ComponentFixture<GeneralWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
