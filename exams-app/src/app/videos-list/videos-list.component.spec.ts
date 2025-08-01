import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideosListComponent } from './videos-list.component';

describe('VideosListComponent', () => {
  let component: VideosListComponent;
  let fixture: ComponentFixture<VideosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [VideosListComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
