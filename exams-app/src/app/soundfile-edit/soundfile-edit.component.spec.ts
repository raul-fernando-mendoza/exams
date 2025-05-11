import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundfileEditComponent } from './soundfile-edit.component';

describe('SoundfileEditComponent', () => {
  let component: SoundfileEditComponent;
  let fixture: ComponentFixture<SoundfileEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SoundfileEditComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(SoundfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
