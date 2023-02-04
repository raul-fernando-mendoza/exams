import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaExamsListComponent } from './materia-exams-list.component';

describe('MateriaExamsListComponent', () => {
  let component: MateriaExamsListComponent;
  let fixture: ComponentFixture<MateriaExamsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MateriaExamsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MateriaExamsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
