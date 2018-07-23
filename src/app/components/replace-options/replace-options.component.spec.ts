import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceOptionsComponent } from './replace-options.component';

describe('ReplaceOptionsComponent', () => {
  let component: ReplaceOptionsComponent;
  let fixture: ComponentFixture<ReplaceOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
