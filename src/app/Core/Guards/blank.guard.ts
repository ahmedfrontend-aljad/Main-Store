import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const blankGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const Token = localStorage.getItem('userToken'); 
    const gusttoken = localStorage.getItem('guestToken'); 

    if (Token) {
      return true;
    }

    if (gusttoken) {
      return router.createUrlTree(['/guest/home']);
    }

    return router.createUrlTree(['/auth/login']);
  }

  return false;
};
