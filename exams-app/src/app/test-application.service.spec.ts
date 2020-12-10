import { TestBed } from '@angular/core/testing';

import { TestApplicationService } from './test-application.service';

describe('TestApplicationService', () => {
  let service: TestApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
