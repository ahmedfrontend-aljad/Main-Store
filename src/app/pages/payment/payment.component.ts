import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { Icart } from '../../Core/Interfaces/icart';
import { CartService } from '../../Core/Services/cart.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { PaymentService } from '../../Core/Services/payment.service';
import { StoreInputComponent } from '../../Shared/components/store-input/store-input.component';
import { SubmitButtonComponent } from '../../Shared/components/submit-button/submit-button.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    StoreInputComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class paymentComponent implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _cartService = inject(CartService);
  private readonly _PaymentService = inject(PaymentService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _translate = inject(TranslateService);
  private readonly _router = inject(Router);
  private readonly _loadingService = inject(LoadingService);

  cartproducts: Icart[] = [];
  InvoiceForm!: FormGroup;
  totalPrice: number = 0;
  userId: string | null = null;
  clientId: any;
  get selectedPaymentMethod(): string {
    return this.InvoiceForm.get('paymentType')?.value?.toString() || '1';
  }
  token = localStorage.getItem('userToken')!;
  decodedToken: any = jwtDecode(this.token);

  get saleInvoiceDetails(): FormArray {
    return this.InvoiceForm.get('saleInvoiceDetails') as FormArray;
  }
  userName = this.decodedToken.given_name;

  ngOnInit(): void {
    this.initForm();

    if (!this.token) {
      this._ToastrService.error('User not logged in!');
      this._router.navigate(['/auth/login']);
      return;
    }

    try {
      this.userId = this.decodedToken.Id;
    } catch (error) {
      this._ToastrService.error('Invalid token. Please log in again.');
      this._router.navigate(['/auth/login']);
      return;
    }

    if (!this.userId) {
      this._ToastrService.error('Invalid token: User ID not found.');
      return;
    }

    this._loadingService.start();
    this._cartService
      .getLoggedCart(this.userId)
      .pipe(finalize(() => this._loadingService.stop()))
      .subscribe({
        next: (res) => {
          if (res?.Obj?.Items?.length > 0) {
            this.cartproducts = res.Obj.Items;
            this.totalPrice = res.Obj.TotalPrice || 0;
            this.populateFormWithCartData(res.Obj);
          } else {
            this._ToastrService.info(
              this._translate.instant('cart.invoice.emptyCart'),
            );
            this.cartproducts = [];
            this.totalPrice = 0;
          }
        },
        error: (err) => {
          console.error(err);
          this._ToastrService.error('Failed to load cart data.');
        },
      });
  }

  initForm(): void {
    const nowISO = new Date().toISOString().split('.')[0];
    this.clientId = Number(localStorage.getItem('profileData'));
    this.InvoiceForm = this._formBuilder.group({
      id: [0],
      insuranceAmount: [0],
      deliveryAddress: [''],
      saleInvoiceReqId: [0],
      saleInvoiceReqDocNo: [0],
      paid: [0],
      reminder: [0],
      totalInvoice: [0],
      totalInvoiceAfterVatIncluded: [0],
      currencyId: [1],
      equivalent: [0],
      clientId: [this.clientId, [Validators.required]],
      clientName: [this.userName],
      userId: [''],
      paymentType: [1],
      workByPriceWithVat: [false],
      docDate: [nowISO],
      notes: [''],
      totalDisc: [0],
      cash: [0],
      visa: [0],
      bankId: [0],
      updatedTableId: [0],
      debt: [0],
      isPendingPayment: [false],
      treasuryId: [0],
      exchangePrice: [1],
      clientType: [1],
      docType: [1],
      storeId: [1],
      isMobile: [true],
      tableId: [0],
      visaTrxType: [1],
      visaTrxNo: [''],
      totalInvoiceVatAmount: [0],
      totalInvoiceAfterVat: [0],
      salesManId: [0],
      totalInvoiceAfterDisc: [0],
      totalDiscRate: [0],
      tobagoVatAmount: [0],
      posType: [1, [Validators.required]],
      saveAndPost: [false],
      banquetDate: [nowISO],
      saleInvoiceDetails: this._formBuilder.array([]),
      saleInvNotesDto: this._formBuilder.array([]),
    });
  }

  private createItemFormGroup(item: any): FormGroup {
    const qty = item.count || item.quantity || item.Quantity || 1;
    const price = item.price || item.Price || 0;
    const todayISO = new Date().toISOString().split('T')[0];

    return this._formBuilder.group({
      branchId: [1],
      price: [price],
      priceIncludeVat: [item.priceIncludeVat || price],
      discount: [item.discount || 0],
      totalDisc: [item.totalDisc || 0],
      discountPercent: [item.discountPercent || 0],
      vat: [item.vat || 15],
      vatAmount: [item.vatAmount || 0],
      itemID: [item.id || item.itemId || item.ProductId || 0],
      weight: [0],
      quantity: [qty],
      count: [qty],
      itemType_Sale: [1],
      offerItemchek: [0],
      uniteId: [item.unitId || 1],
      uniteName: [item.unitName || ''],
      nameAr: [item.name || item.productName || item.ProductName || ''],
      productId: [item.productId || item.id || item.ProductId || 0],
      productBarcode: [''],
      productCode: [''],
      productGtin: [''],
      patchCode: [''],
      expirationDate: [
        item.expirationDate ? `${item.expirationDate}T00:00:00` : todayISO,
      ],
      totalPrice: [item.totalPrice || price * qty],
      totalPriceAfterVat: [item.totalPriceAfterVat || price * qty],
      totalPriceAfterDiscount: [item.totalPriceAfterDiscount || price * qty],
      isProductFree: [false],
      isHasBonus: [false],
      isProductBonus: [false],
      notes: [''],
      tobagoVat: [0],
      tobagoVatAmount: [0],
      costCenterId: [0],
      costCenterName: [''],
    });
  }

  populateFormWithCartData(cartObj: any): void {
    this.saleInvoiceDetails.clear();

    this.cartproducts.forEach((item) => {
      this.saleInvoiceDetails.push(this.createItemFormGroup(item));
    });

    const total = cartObj.TotalPrice || this.totalPrice;
    const vat = cartObj.TotalVat || 0;
    const grandTotal = cartObj.TotalPriceAfterVat || total;

    this.InvoiceForm.patchValue({
      clientId: this.clientId,
      userId: this.userId || '',
      totalInvoice: total,
      totalInvoiceVatAmount: vat,
      totalInvoiceAfterVat: grandTotal,
      totalInvoiceAfterDisc: total,
      equivalent: grandTotal,
      paid: grandTotal,
      cash: grandTotal,
    });
  }

  createInvoice(): void {
    if (this.InvoiceForm.invalid) {
      this.InvoiceForm.markAllAsTouched();
      this._ToastrService.error(
        this._translate.instant('cart.invoice.validationError'),
      );
      return;
    }

    let createdInvoiceId: string = '';
    this._loadingService.start();

    this._PaymentService
      .createPaymentInvoice(this.InvoiceForm.value)
      .pipe(
        switchMap((res: any) => {
          if (res?.IsSuccess || res?.isSuccess || res?.Obj) {
            createdInvoiceId = res?.Obj?.Id || res?.Id || res?.id || '';
            return this._cartService.clearCart(this.userId!);
          } else {
            this._ToastrService.error(res?.Message);
            return EMPTY;
          }
        }),
        finalize(() => this._loadingService.stop()),
      )
      .subscribe({
        next: (res) => {
          this._ToastrService.success(this._translate.instant(res?.Message));
          localStorage.removeItem('items');
          localStorage.removeItem('cartCount');

          this._router.navigate(['/allOrders'], {
            queryParams: { invoiceId: createdInvoiceId },
          });
        },
        error: (err) => {
          console.error(err);
          this._ToastrService.error(err?.error?.Message);
        },
      });
  }
}
