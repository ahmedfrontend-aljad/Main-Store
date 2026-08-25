import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly _DataService = inject(DataService);

  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  getHeaders(): HttpHeaders {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const userToken = localStorage.getItem('userToken');
      const guestToken = localStorage.getItem('guestToken');

      const token = userToken || guestToken;

      return new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : '',
      });
    }
    return new HttpHeaders();
  }

  getAllCategories(): Observable<any> {
    return this._DataService.get(
      `${apiUrl}/XtraAndPos_GeneralLookups/GetStoreItemGroupsAndItemsAndUnits`,
      {
        headers: this.getHeaders(),
      },
    );
  }
}
