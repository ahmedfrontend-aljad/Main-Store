import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authLoginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userToken = localStorage.getItem('E_K_T');

  if (userToken) {
    return router.navigate(['/home']);
  }

  return true;
};
