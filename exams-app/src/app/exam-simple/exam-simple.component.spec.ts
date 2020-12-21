import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamSimpleComponent } from './exam-simple.component';

describe('ExamSimpleComponent', () => {
  let component: ExamSimpleComponent;
  let fixture: ComponentFixture<ExamSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamSimpleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
