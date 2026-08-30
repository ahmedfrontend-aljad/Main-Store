import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../../Core/Services/cart.service';
import { LoadingService } from '../../../Core/Services/loading.service';
import { PaymentService } from '../../../Core/Services/payment.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule],
  templateUrl: './cash-payment.component.html',
  styleUrl: './cash-payment.component.scss',
})
export class CashPaymentComponent implements OnInit {
  private readonly _Fb = inject(FormBuilder);
  private readonly _Router = inject(Router);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _CartService = inject(CartService);
  private readonly _PaymentService = inject(PaymentService);
  private readonly _LoadingService = inject(LoadingService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _TranslateService = inject(TranslateService);

  paymentForm!: FormGroup;
  userId: string = '';

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    this.initForm();
  }

  initForm(): void {
    this.paymentForm = this._Fb.group({
      details: ['', [Validators.required]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)],
      ],
      city: ['', [Validators.required]],
    });
  }

  submitCashOrder(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this._LoadingService.start();

    const orderPayload = {
      userId: this.userId,
      shippingAddress: {
        details: this.paymentForm.value.details,
        phone: this.paymentForm.value.phone,
        city: this.paymentForm.value.city,
      },
      paymentMethod: 'Cash',
    };

    /*  this._PaymentService.createCashPaymentInvoice(orderPayload).subscribe({
      next: (res) => {
        const invoiceId = res?.Obj?.InvoiceId || res?.invoiceId;

        this._PaymentService.postAndMarkPaid(invoiceId).subscribe({
          next: () => {
            this._CartService.clearCart(this.userId).subscribe({
              next: () => {
                this._LoadingService.stop();
                localStorage.removeItem('cartItems');
                this._ToastrService.success('تم تأكيد الطلب بنجاح!');

                this._Router.navigate(['/cart-invoice'], {
                  queryParams: { invoiceId: invoiceId },
                });
              },
              error: () => this.handleError('فشل تفريغ السلة'),
            });
          },
          error: () => this.handleError('فشل اعتماد الفاتورة'),
        });
      },
      error: (err) =>
        this.handleError(err?.error?.Message || 'حدث خطأ أثناء إرسال الطلب'),
    });*/
  }
}
