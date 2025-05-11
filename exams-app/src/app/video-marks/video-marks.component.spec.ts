import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoMarksComponent } from './video-marks.component';

describe('VideoMarksComponent', () => {
  let component: VideoMarksComponent;
  let fixture: ComponentFixture<VideoMarksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [VideoMarksComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(VideoMarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
