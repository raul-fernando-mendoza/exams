import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryEditComponent } from './laboratory-edit.component';

describe('LaboratoryEditComponent', () => {
  let component: LaboratoryEditComponent;
  let fixture: ComponentFixture<LaboratoryEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [LaboratoryEditComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
