import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamgradesReportComponent } from './examgrades-report.component';

describe('ExamgradesReportComponent', () => {
  let component: ExamgradesReportComponent;
  let fixture: ComponentFixture<ExamgradesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ExamgradesReportComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamgradesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
