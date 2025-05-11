import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryGradeEditComponent } from './laboratory-grade-edit.component';

describe('LaboratoryGradeEditComponent', () => {
  let component: LaboratoryGradeEditComponent;
  let fixture: ComponentFixture<LaboratoryGradeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [LaboratoryGradeEditComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryGradeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
