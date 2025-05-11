import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarSliderComponent } from './star-slider.component';

describe('StarSliderComponent', () => {
  let component: StarSliderComponent;
  let fixture: ComponentFixture<StarSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [StarSliderComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StarSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
