import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { blankGuard } from './blank.guard';

describe('blankGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => blankGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
