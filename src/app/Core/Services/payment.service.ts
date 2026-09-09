import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly _DataService = inject(DataService);

  createPaymentInvoice(body: any): Observable<any> {
    return this._DataService.post(
      `${apiUrl}/XtraAndPos_StoreInvoices/CreateInvoiceForMobile`,
      body,
    );
  }
}
