import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly _DataService = inject(DataService);
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);

  private getInitialCount(): number {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const savedCount = localStorage.getItem('cartCount');
      return savedCount ? parseInt(savedCount, 10) : 0;
    }
    return 0;
  }

  private cartCountSubject = new BehaviorSubject<number>(
    this.getInitialCount(),
  );
  cartCount$: Observable<number> = this.cartCountSubject.asObservable();

  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      localStorage.setItem('cartCount', count.toString());
    }
  }

  getLoggedCart(userId: any): Observable<any> {
    return this._DataService
      .get(`${apiUrl}/XtraAndPos_StoreCart/GetCartAsync?userId=${userId}`)
      .pipe(
        tap((res: any) => {
          if (res?.IsSuccess) {
            const count = res.Obj?.Items?.length || 0;
            this.updateCartCount(count);
          }
        }),
      );
  }

  addToCart(data: object): Observable<any> {
    return this._DataService
      .post(`${apiUrl}/XtraAndPos_StoreCart/AddToCartAsync`, data)
      .pipe(
        tap((res: any) => {
          if (res?.IsSuccess) {
            if (res.Obj?.Items) {
              this.updateCartCount(res.Obj.Items.length);
            } else {
              const current = this.cartCountSubject.value;
              this.updateCartCount(current + 1);
            }
          }
        }),
      );
  }

  SyncCartFromLocal(data: { items: any[]; userId: any }): Observable<any> {
    return this._DataService
      .post(`${apiUrl}/XtraAndPos_StoreCart/SyncCartFromLocalAsync`, data)
      .pipe(
        tap((res: any) => {
          if (res?.IsSuccess) {
            const count = res.Obj?.Items?.length || 0;
            this.updateCartCount(count);
          }
        }),
      );
  }

  clearCart(userId: any): Observable<any> {
    return this._DataService
      .delete(`${apiUrl}/NewStore/Cart/ClearCart?userId=${userId}`)
      .pipe(
        tap((res: any) => {
          if (res?.IsSuccess) {
            this.updateCartCount(0);
          }
        }),
      );
  }
}
