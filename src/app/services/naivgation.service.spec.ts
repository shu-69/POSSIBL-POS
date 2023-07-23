import { TestBed } from '@angular/core/testing';

import { NaivgationService } from './naivgation.service';

describe('NaivgationService', () => {
  let service: NaivgationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NaivgationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
