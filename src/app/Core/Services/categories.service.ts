import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../Environments/environment';
import { AllProductsService } from './all-products.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  constructor(private readonly _HttpClient: HttpClient) {}

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
    return this._HttpClient.get(
      `${environment.baseUrl}/XtraAndPos_GeneralLookups/GetStoreItemGroupsAndItemsAndUnits`,
      {
        headers: this.getHeaders(),
      }
    );
  }
}
