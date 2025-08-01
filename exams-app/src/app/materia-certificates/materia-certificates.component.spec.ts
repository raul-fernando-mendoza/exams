import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule as MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule as MatTableModule } from '@angular/material/table';

import { MateriaCertificatesComponent } from './materia-certificates.component';

describe('MateriaCertificatesComponent', () => {
  let component: MateriaCertificatesComponent;
  let fixture: ComponentFixture<MateriaCertificatesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        NoopAnimationsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MateriaCertificatesComponent,
    ]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MateriaCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
