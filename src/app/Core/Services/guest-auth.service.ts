import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class GuestAuthService {
  private readonly _DataService = inject(DataService);
  private readonly _PlatformId = inject(PLATFORM_ID);

  ensureGuestToken(): Observable<any> {
    if (!isPlatformBrowser(this._PlatformId)) {
      return of(null);
    }

    const userToken = localStorage.getItem('userToken');
    const guestToken = localStorage.getItem('guestToken');

    if (userToken || guestToken) {
      return of(true);
    }

    return this._DataService
      .post(`${apiUrl}/Login`, {
        companyId: 1,
        branchId: 1,
        userName: 'Admin',
        password: 'Admin123',
        rememberMe: false,
        getRoles: true,
      })
      .pipe(
        tap((res: any) => {
          console.log(res);

          const token = res.Obj.AccessToken;
          if (token) {
            localStorage.setItem('guestToken', token);
          }
        }),
        catchError((err) => {
          console.error('Failed to Login As guest:', err);
          return of(null);
        }),
      );
  }
}
