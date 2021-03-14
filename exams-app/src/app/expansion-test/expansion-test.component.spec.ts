import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpansionTestComponent } from './expansion-test.component';

describe('ExpansionTestComponent', () => {
  let component: ExpansionTestComponent;
  let fixture: ComponentFixture<ExpansionTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpansionTestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpansionTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
