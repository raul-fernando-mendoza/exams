import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateTypeEditComponent } from './certificate-type-edit.component';

describe('CertificateTypeEditComponent', () => {
  let component: CertificateTypeEditComponent;
  let fixture: ComponentFixture<CertificateTypeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateTypeEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateTypeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
