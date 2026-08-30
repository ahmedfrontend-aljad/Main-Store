import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../Shared/constants/api.constant';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly _DataService = inject(DataService);

  createVisaPaymentInvoice(data: any): Observable<any> {
    return this._DataService.post(
      `${apiUrl}/NewStore/Order/CreateVisaInvoice`,
      data,
    );
  }

  postAndMarkPaid(invoiceId: string): Observable<any> {
    return this._DataService.post(
      `${apiUrl}/NewStore/Order/PostAndMarkPaid?invoiceId=${invoiceId}`,
      {},
    );
  }
}
