import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerEditComponent } from './career-edit.component';

describe('CareerEditComponent', () => {
  let component: CareerEditComponent;
  let fixture: ComponentFixture<CareerEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CareerEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CareerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
