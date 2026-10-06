import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const blankGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userToken = localStorage.getItem('E_K_T');

  if (userToken) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
