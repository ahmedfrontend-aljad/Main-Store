import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class AllProductsService {
  private readonly _DataService = inject(DataService);

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
    );
  }
}
