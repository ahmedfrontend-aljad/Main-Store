import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';
import { apiUrl, StoreUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _DataService = inject(DataService);
  private readonly _ToastrService = inject(ToastrService);

  sendLoginData(data: object): Observable<any> {
    return this._DataService.post(`${apiUrl}/Login`, data).pipe(
      catchError((err) => {
        console.error('Login error:', err);
        this._ToastrService.show(err.Message);
        return throwError(() => err);
      }),
    );
  }

  sendRegisterData(data: object): Observable<any> {
    return this._DataService.post(`${apiUrl}/CreateUserForStore`, data).pipe(
      catchError((err) => {
        console.error('Register error:', err);
        this._ToastrService.show(err.Message);
        return throwError(() => err);
      }),
    );
  }

  restPassword(data: any) {
    return this._DataService.post(`${StoreUrl}/User/ResetPassword`, data).pipe(
      catchError((err) => {
        console.error('Rest Password error:', err);
        this._ToastrService.show(err.Message);
        return throwError(() => err);
      }),
    );
  }
}
