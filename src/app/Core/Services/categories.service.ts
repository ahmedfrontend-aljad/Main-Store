import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly _DataService = inject(DataService);

  getAllCategories(): Observable<any> {
    return this._DataService.get(
      `${apiUrl}/XtraAndPos_GeneralLookups/GetStoreItemGroupsAndItemsAndUnits`,
    );
  }
}
