import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly _DataService = inject(DataService);

  getLoggedCart(userId: string): Observable<any> {
    return this._DataService.get(
      `${apiUrl}/XtraAndPos_StoreCart/GetCartAsync?userId=${userId}`,
    );
  }

  SyncCartFromLocal(data: {
    cartItems: any[];
    userId: string;
  }): Observable<any> {
    return this._DataService.post(
      `${apiUrl}/XtraAndPos_StoreCart/SyncCartFromLocalAsync`,
      data,
    );
  }

  clearCart(userId: string): Observable<any> {
    return this._DataService.delete(
      `${apiUrl}/NewStore/Cart/ClearCart?userId=${userId}`,
    );
  }

  addToCart(data: object): Observable<any> {
    return this._DataService.post(
      `${apiUrl}/XtraAndPos_StoreCart/AddToCartAsync`,
      data,
    );
  }
}
