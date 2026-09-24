import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentService } from '../../../Shared/Services/payment.service';

@Component({
  selector: 'app-order-success',
  imports: [TranslateModule, CurrencyPipe, RouterLink],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.scss',
})
export class OrderSuccessComponent {
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _PaymentService = inject(PaymentService);

  orderDetails: any = null;
  orderId: any;

  ngOnInit(): void {
    this._ActivatedRoute.queryParams.subscribe((params) => {
      this.orderId = params['id'];

      if (this.orderId) {
        this.getInvoiceOrderDetails(this.orderId);
      } else {
      }
    });
  }

  getInvoiceOrderDetails(id: string): void {
    const params = {
      id: id,
    };

    this._PaymentService.getInvoiceById(params).subscribe({
      next: (res) => {
        this.orderDetails = res.Obj;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
