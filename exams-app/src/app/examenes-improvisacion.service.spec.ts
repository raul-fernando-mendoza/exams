import { TestBed } from '@angular/core/testing';

import { ExamenesImprovisacionService } from './examenes-improvisacion.service';

describe('ExamenesImprovisacionService', () => {
  let service: ExamenesImprovisacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamenesImprovisacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
