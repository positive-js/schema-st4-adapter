import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentActionsComponent } from './recent-actions.component';

describe('RecentActionsComponent', () => {
  let component: RecentActionsComponent;
  let fixture: ComponentFixture<RecentActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
