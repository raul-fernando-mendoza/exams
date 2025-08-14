import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaSelectDialogComponent } from './materia-select-dialog.component';

describe('MateriaSelectDialogComponent', () => {
  let component: MateriaSelectDialogComponent;
  let fixture: ComponentFixture<MateriaSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriaSelectDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MateriaSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
