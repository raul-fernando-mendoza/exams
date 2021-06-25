import { TestBed } from '@angular/core/testing';

import { ExamFormService } from './exam-form.service';

describe('ExamFormService', () => {
  let service: ExamFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
