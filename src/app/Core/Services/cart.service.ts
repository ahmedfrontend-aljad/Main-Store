import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl, StoreUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly _DataService = inject(DataService);

  getLoggedCart(userId: string): Observable<any> {
    return this._DataService.get(
      `${apiUrl}/NewStore/Cart/GetCart?userId=${userId}`,
    );
  }

  SyncCartFromLocal(data: {
    cartItems: any[];
    userId: string;
  }): Observable<any> {
    return this._DataService.post(`${apiUrl}/NewStore/Cart/SyncCart`, data);
  }

  clearCart(userId: string): Observable<any> {
    return this._DataService.delete(
      `${apiUrl}/NewStore/Cart/ClearCart?userId=${userId}`,
    );
  }

  addToCart(data: object): Observable<any> {
    return this._DataService.post(`${StoreUrl}/Cart/AddToCart`, data);
  }

}
