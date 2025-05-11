import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamGradesSearchComponent } from './exam-grades-search.component';

describe('MateriaEnrollmentsExamsComponent', () => {
  let component: ExamGradesSearchComponent;
  let fixture: ComponentFixture<ExamGradesSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ExamGradesSearchComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(ExamGradesSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
