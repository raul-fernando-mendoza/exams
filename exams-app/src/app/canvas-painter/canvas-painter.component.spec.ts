import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasPainterComponent } from './canvas-painter.component';

describe('CanvasPainterComponent', () => {
  let component: CanvasPainterComponent;
  let fixture: ComponentFixture<CanvasPainterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasPainterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasPainterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
