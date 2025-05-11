import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaEnrollmentsListComponent } from './materia-enrollments-list.component';

describe('MateriaEnrollmentsListComponent', () => {
  let component: MateriaEnrollmentsListComponent;
  let fixture: ComponentFixture<MateriaEnrollmentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MateriaEnrollmentsListComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(MateriaEnrollmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
