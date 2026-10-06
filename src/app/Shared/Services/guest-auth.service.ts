import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from '../constants/api.constant';
import { DataService } from './data.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class GuestAuthService {
  private readonly _DataService = inject(DataService);
  private readonly _LoadingService = inject(LoadingService);

  async ensureGuestToken(): Promise<string | null> {
    const userToken = localStorage.getItem('E_K_T');
    const guestToken = localStorage.getItem('guestToken');

    if (userToken || guestToken) {
      return userToken || guestToken;
    }

    this._LoadingService.start();
    try {
      const res: any = await firstValueFrom(
        this._DataService.post(`${apiUrl}/NewStore/Guest/Enter`, {
          branchId: 1,
        }),
      );
      this._LoadingService.stop();

      const token = res?.Obj?.AccessToken;
      if (token) {
        localStorage.setItem('guestToken', token);
        return token;
      }
      return null;
    } catch (err) {
      this._LoadingService.stop();
      console.error('Failed to Login As guest:', err);
      return null;
    }
  }
}
