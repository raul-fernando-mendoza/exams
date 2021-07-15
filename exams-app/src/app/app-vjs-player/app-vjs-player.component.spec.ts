import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppVjsPlayerComponent } from './app-vjs-player.component';

describe('AppVjsPlayerComponent', () => {
  let component: AppVjsPlayerComponent;
  let fixture: ComponentFixture<AppVjsPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppVjsPlayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppVjsPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
