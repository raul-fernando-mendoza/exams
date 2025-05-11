import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EiTipoEditComponent } from './ei-tipo-edit.component';

describe('EiTipoEditComponent', () => {
  let component: EiTipoEditComponent;
  let fixture: ComponentFixture<EiTipoEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [EiTipoEditComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EiTipoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
