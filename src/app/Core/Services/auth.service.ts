import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { apiUrl, StoreUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _DataService = inject(DataService);
  header = {
    token: '',
  };

  sendLoginData(data: object): Observable<any> {
    return this._DataService.post(`${apiUrl}/Login`, data).pipe(
      catchError((err) => {
        console.error('Login error:', err);
        return throwError(() => err);
      }),
    );
  }

  sendRegisterData(data: object): Observable<any> {
    return this._DataService
      .post(`${apiUrl}/CreateUserForStore`, data, {
        headers: this.header,
      })
      .pipe(
        catchError((err) => {
          console.error('Login error:', err);
          return throwError(() => err);
        }),
      );
  }

  restPassword(data: any) {
    return this._DataService
      .post(`${StoreUrl}/User/ResetPassword`, data, {
        headers: this.header,
      })
      .pipe(
        catchError((err) => {
          console.error('Login error:', err);
          return throwError(() => err);
        }),
      );
  }
}
