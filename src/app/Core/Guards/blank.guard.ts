import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const blankGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const userToken = localStorage.getItem('userToken');

    if (userToken) {
      return true;
    }

    return router.createUrlTree(['/auth/login']);
  }

  return false;
};
