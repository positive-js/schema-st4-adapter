import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversionOptionsComponent } from './replace-options.component';

describe('ReplaceOptionsComponent', () => {
  let component: ConversionOptionsComponent;
  let fixture: ComponentFixture<ConversionOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversionOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversionOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
