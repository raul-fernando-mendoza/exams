import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComputestatusComponent } from './computestatus.component';

describe('ComputestatusComponent', () => {
  let component: ComputestatusComponent;
  let fixture: ComponentFixture<ComputestatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ComputestatusComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(ComputestatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
