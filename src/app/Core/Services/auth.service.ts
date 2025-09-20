import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../Environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly _HttpClient: HttpClient) {}
  header = {
    token: '',
  };

  sendLoginData(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}/Login`, data).pipe(
      catchError((err) => {
        console.error('Login error:', err);
        return throwError(() => err);
      })
    );
  }

  sendRegisterData(data: object): Observable<any> {
    return this._HttpClient
      .post(`${environment.baseUrl}/CreateUserForStore`, data, {
        headers: this.header,
      })
      .pipe(
        catchError((err) => {
          console.error('Login error:', err);
          return throwError(() => err);
        })
      );
  }
}
