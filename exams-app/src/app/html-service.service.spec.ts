import { TestBed } from '@angular/core/testing';

import { HtmlServiceService } from './html-service.service';

describe('HtmlServiceService', () => {
  let service: HtmlServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
