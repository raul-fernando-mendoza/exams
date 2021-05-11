import { TestBed } from '@angular/core/testing';

import { StripeclientService } from './stripeclient.service';

describe('StripeclientService', () => {
  let service: StripeclientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StripeclientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
