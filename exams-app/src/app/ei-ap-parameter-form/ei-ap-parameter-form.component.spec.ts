import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EiApParameterFormComponent } from './ei-ap-parameter-form.component';

describe('EiApParameterFormComponent', () => {
  let component: EiApParameterFormComponent;
  let fixture: ComponentFixture<EiApParameterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EiApParameterFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EiApParameterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
