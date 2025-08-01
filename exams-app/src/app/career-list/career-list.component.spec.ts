import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareerListComponent } from './career-list.component';

describe('CareerListComponent', () => {
  let component: CareerListComponent;
  let fixture: ComponentFixture<CareerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CareerListComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CareerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
