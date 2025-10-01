import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../Environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private readonly _HttpClient: HttpClient) {}

  addToCart(data: object): Observable<any> {
    return this._HttpClient.post(
      `${environment.baseUrl}/XtraAndPos_StoreCart/AddToCartAsync`,
      data
    );
  }

  getLoggedCart(userId: string): Observable<any> {
    return this._HttpClient.get(
      `${environment.baseUrl}/XtraAndPos_StoreCart/GetCartAsync?userId=${userId}`
    );
  }

  CartFromLocal(data: object): Observable<any> {
    return this._HttpClient.post(
      `${environment.baseUrl}/SyncCartFromLocalAsync`,
      data
    );
  }

  SyncCartFromLocal(data: any): Observable<any> {
    return this._HttpClient.post(
      `${environment.baseUrl}/XtraAndPos_StoreCart/SyncCartFromLocalAsync`,
      data
    );
  }
}
