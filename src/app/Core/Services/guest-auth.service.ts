import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';
import { LoadingService } from './loading.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class GuestAuthService {
  private readonly _DataService = inject(DataService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _LoadingService = inject(LoadingService);
  private readonly _Router = inject(Router);

  ensureGuestToken() {
    this._LoadingService.start();
    firstValueFrom(
      this._DataService
        .post(`${apiUrl}/NewStore/Guest/Enter`, {
          branchId: 1,
        })
        .pipe(
          tap((res) => {
            this._LoadingService.stop();

            this._ToastrService.success(res?.Message);
            const token = res.Obj.AccessToken;
            this._Router.navigate(['/home']);

            if (token) {
              localStorage.setItem('userToken', token);
            }
          }),
          catchError((err) => {
            this._LoadingService.stop();
            console.error('Failed to Login As guest:', err);
            return of(null);
          }),
        ),
    );
  }
}
