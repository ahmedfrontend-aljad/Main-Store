import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly _DataService = inject(DataService);
  
  addToCart(data: object): Observable<any> {
    return this._DataService.post(`${apiUrl}/NewStore/Cart/AddToCart`, data);
  }

  getLoggedCart(userId: string): Observable<any> {
    return this._DataService.get(
      `${apiUrl}/XtraAndPos_StoreCart/GetCartAsync?userId=${userId}`,
    );
  }

  CartFromLocal(data: object): Observable<any> {
    return this._DataService.post(`${apiUrl}/SyncCartFromLocalAsync`, data);
  }

  SyncCartFromLocal(data: any): Observable<any> {
    return this._DataService.post(
      `${apiUrl}/XtraAndPos_StoreCart/SyncCartFromLocalAsync`,
      data,
    );
  }

  createMoyasarInvoice(data: object): Observable<any> {
    return this._DataService.post(
      `${apiUrl}/XtraAndPos_StoreInvoices/CreateInvoiceForStore`,
      data,
    );
  }

  /*createMoyasarInvoiceOnly(data: any): Observable<any> {
    return this._DataService.post(
      `${apiUrl}/CreateMoyasarInvoiceOnly`,
      data
    );
  }*/

  moyasarCallback(data: any): Observable<any> {
    return this._DataService.post(`${apiUrl}/MoyasarCallback`, data);
  }
}
