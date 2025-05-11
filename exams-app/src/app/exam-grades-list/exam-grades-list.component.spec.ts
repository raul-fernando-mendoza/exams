import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamGradesListComponent } from './exam-grades-list.component';

describe('ExamGradesListComponent', () => {
  let component: ExamGradesListComponent;
  let fixture: ComponentFixture<ExamGradesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ExamGradesListComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(ExamGradesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
