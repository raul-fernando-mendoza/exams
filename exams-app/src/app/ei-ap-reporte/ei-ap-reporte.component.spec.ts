import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EiApReporteComponent } from './ei-ap-reporte.component';

describe('EiApReporteComponent', () => {
  let component: EiApReporteComponent;
  let fixture: ComponentFixture<EiApReporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EiApReporteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EiApReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
