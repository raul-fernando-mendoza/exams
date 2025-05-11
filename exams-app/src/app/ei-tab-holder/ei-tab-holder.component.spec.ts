import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EiTabHolderComponent } from './ei-tab-holder.component';

describe('EiTabHolderComponent', () => {
  let component: EiTabHolderComponent;
  let fixture: ComponentFixture<EiTabHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [EiTabHolderComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EiTabHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
