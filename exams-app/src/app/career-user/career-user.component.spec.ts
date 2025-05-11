import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerUserComponent } from './career-user.component';

describe('CareerUserComponent', () => {
  let component: CareerUserComponent;
  let fixture: ComponentFixture<CareerUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CareerUserComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CareerUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
