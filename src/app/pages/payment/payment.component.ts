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
import { HelperService } from '../../Core/Services/helper.service';
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
  private readonly _HelperService = inject(HelperService);

  cartproducts: Icart[] = [];
  InvoiceForm!: FormGroup;
  totalPrice: number = 0;
  userId: string | null = null;

  get selectedPaymentMethod(): string {
    return this.InvoiceForm.get('paymentType')?.value?.toString() || '1';
  }

  get saleInvoiceDetails(): FormArray {
    return this.InvoiceForm.get('saleInvoiceDetails') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
    this.listenToPaymentMethodChange();

    const token = localStorage.getItem('userToken');
    if (!token) {
      this._ToastrService.error('User not logged in!');
      this._router.navigate(['/auth/login']);
      return;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      this.userId = decodedToken.Id || decodedToken.id || decodedToken.nameid;
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
            this.totalPrice = res.Obj.TotalPrice;
            this.populateFormWithCartData();
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
    const now = new Date();
    const dateTimeISO = now.toISOString().replace('T', ' ').split('.')[0];
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
      clientId: [0, [Validators.required]],
      clientName: [''],
      userId: [''],
      paymentType: [1],
      workByPriceWithVat: [true],
      docDate: [dateTimeISO],
      notes: [''],
      totalDisc: [0],
      cash: [0],
      visa: [0.0],
      bankId: [0],
      updatedTableId: [0],
      debt: [0.0],
      isPendingPayment: [false],
      treasuryId: [null],
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
      banquetDate: [null],
      saleInvoiceDetails: this._formBuilder.array([]),
      saleInvNotesDto: this._formBuilder.array([]),
    });
  }

  private createItemFormGroup(item: any): FormGroup {
    const qty = Number(item.count || item.quantity || item.Quantity || 1);
    const unitPrice = Number(item.price || item.Price || 0);
    const vatRate = 15;

    const vatAmount = (unitPrice * qty * vatRate) / 100;
    const totalPriceAfterVat = unitPrice * qty + vatAmount;

    return this._formBuilder.group({
      branchId: [0],
      price: [unitPrice],
      priceIncludeVat: [unitPrice],
      discount: [0.0],
      totalDisc: [0],
      discountPercent: [0.0],
      vat: [vatRate],
      vatAmount: [vatAmount],
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
      productBarcode: [null],
      productCode: [''],
      productGtin: [''],
      patchCode: [''],
      expirationDate: [new Date().toISOString().split('T')[0]],
      totalPrice: [unitPrice * qty],
      totalPriceAfterVat: [totalPriceAfterVat],
      totalPriceAfterDiscount: [unitPrice],
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

  private listenToPaymentMethodChange(): void {
    this.InvoiceForm.get('paymentType')?.valueChanges.subscribe((type) => {
      const selectedType = Number(type);
      if (selectedType === 1) {
        this.InvoiceForm.patchValue(
          {
            cash: this.totalPrice,
            paid: this.totalPrice,
            visa: 0.0,
            visaTrxNo: '',
          },
          { emitEvent: false },
        );
      } else if (selectedType === 2) {
        this.InvoiceForm.patchValue(
          {
            cash: 0.0,
            visa: this.totalPrice,
            paid: this.totalPrice,
          },
          { emitEvent: false },
        );
      }
    });
  }

  populateFormWithCartData(): void {
    this.saleInvoiceDetails.clear();

    this.cartproducts.forEach((item) => {
      this.saleInvoiceDetails.push(this.createItemFormGroup(item));
    });

    const numericClientId = Number(this.userId);
    const validClientId =
      !isNaN(numericClientId) && numericClientId > 0 ? numericClientId : 1;

    this.InvoiceForm.patchValue({
      clientId: validClientId,
      userId: this.userId,
      totalInvoice: this.totalPrice,
      totalInvoiceAfterVat: this.totalPrice,
      totalInvoiceAfterDisc: this.totalPrice,
      equivalent: this.totalPrice,
      paid: this.totalPrice,
      cash: this.totalPrice,
      visa: 0.0,
      debt: 0.0,
      storeId: 1,
      isMobile: true,
      saveAndPost: false,
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

    const payload = this.InvoiceForm.value;
    this._PaymentService
      .createPaymentInvoice(payload)
      .pipe(
        switchMap((res: any) => {
          if (res?.IsSuccess || res?.isSuccess || res?.Obj) {
            createdInvoiceId = res?.Obj?.Id || res?.Id || res?.id || '';
            return this._cartService.clearCart(this.userId!);
          } else {
            this._ToastrService.error(
              res?.Message || 'فشلت عملية إنشاء الفاتورة',
            );
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
          this._ToastrService.error('حدث خطأ أثناء معالجة الطلب.');
        },
      });
  }
}
