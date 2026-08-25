import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class AllProductsService {
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private readonly _DataService = inject(DataService);

  // Get Headers
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

  getPagedItem(pageNun: number, pagsize: number): Observable<any> {
    return this._DataService.get(
      `${apiUrl}/XtraAndPOS_Store/GetPagedItems?pageNumber=${pageNun}&pageSize=${pagsize}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  getProductDetails(id: string | null): Observable<any> {
    return this._DataService.get(
      `${apiUrl}/XtraAndPOS_Store/GetItemById?id=${id}`,
      {
        headers: this.getHeaders(),
      },
    );
  }
}
