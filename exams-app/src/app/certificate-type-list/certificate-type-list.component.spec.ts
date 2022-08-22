import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateTypeListComponent } from './certificate-type-list.component';

describe('CertificateTypeListComponent', () => {
  let component: CertificateTypeListComponent;
  let fixture: ComponentFixture<CertificateTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateTypeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
