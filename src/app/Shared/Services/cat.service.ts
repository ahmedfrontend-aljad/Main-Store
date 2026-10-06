import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, shareReplay, throwError } from 'rxjs';
import { apiUrl } from '../constants/api.constant';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class CatService {
  private readonly _DataService = inject(DataService);
  private groups$?: Observable<any[]>;

  getCategories(): Observable<any[]> {
    if (!this.groups$) {
      this.groups$ = this._DataService
        .get(
          `${apiUrl}/XtraAndPos_GeneralLookups/GetStoreItemGroupsAndItemsAndUnits`,
        )
        .pipe(
          map((res: any) => (res?.IsSuccess ? res.Obj?.Groups || [] : [])),
          shareReplay({ bufferSize: 1, refCount: false }),
          catchError((err) => {
            this.groups$ = undefined;
            return throwError(() => err);
          }),
        );
    }
    return this.groups$;
  }

  clearCache(): void {
    this.groups$ = undefined;
  }
}
