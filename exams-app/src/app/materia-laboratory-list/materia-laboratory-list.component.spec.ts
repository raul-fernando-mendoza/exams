import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaLaboratoryListComponent } from './materia-laboratory-list.component';

describe('MateriaLaboratoryListComponent', () => {
  let component: MateriaLaboratoryListComponent;
  let fixture: ComponentFixture<MateriaLaboratoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MateriaLaboratoryListComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(MateriaLaboratoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
