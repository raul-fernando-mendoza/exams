import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionEditComponent } from './revision-edit.component';

describe('RevisionEditComponent', () => {
  let component: RevisionEditComponent;
  let fixture: ComponentFixture<RevisionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevisionEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
