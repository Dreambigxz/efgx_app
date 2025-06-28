import { TestBed } from '@angular/core/testing';

import { TronService } from './tron.service';

describe('TronService', () => {
  let service: TronService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TronService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
