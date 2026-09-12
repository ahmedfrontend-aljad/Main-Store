import { isPlatformBrowser } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
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
      const userToken =
        localStorage.getItem('userToken') || localStorage.getItem('guestToken');

      const token = userToken;

      return new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : '',
      });
    }
    return new HttpHeaders();
  }

  getPagedItem(pageNo: any, PageSize: any, text: any): Observable<any> {
    const params = {
      pageNumber: pageNo,
      pageSize: PageSize,
      searchTerm: text ?? '',
    };
    return this._DataService.get(`${apiUrl}/XtraAndPOS_Store/GetPagedItems`, {
      params,
    });
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
