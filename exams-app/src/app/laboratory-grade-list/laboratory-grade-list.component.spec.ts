import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryGradeListComponent } from './laboratory-grade-list.component';

describe('LaboratoryGradeListComponent', () => {
  let component: LaboratoryGradeListComponent;
  let fixture: ComponentFixture<LaboratoryGradeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [LaboratoryGradeListComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryGradeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
