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
    return this.InvoiceForm.get('paymentTypeMethod')?.value || '1';
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
      this.userId = decodedToken.Id || decodedToken.id;
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
    this.InvoiceForm = this._formBuilder.group({
      clienName: ['', Validators.required],
      salesManId: [0],
      salesManName: [''],
      id: [0],
      serial: [''],
      branchId: [1],
      posType: [1],
      banquetDate: [''],
      driverId: [0],
      paymentTypeMethod: ['1'],
      cash: [0],
      visa: [0],
      debt: [0],
      clientId: [null],
      superVisorId: [0],
      superVisorName: [''],
      notes: [''],
      isPendingPayment: [true],
      tableId: [0],
      isMobile: [true],
      treasuryId: [0],
      exchangePrice: [0],
      curancyId: [0],
      saleInvoiceDetails: this._formBuilder.array([]),
      saleInvNotesDto: this._formBuilder.array([]),
      saleInvoiceDiscountDtos: this._formBuilder.array([]),
      clientType: [1],
      docType: [0],
      docDate: [new Date().toISOString().split('T')[0]],
      bankId: [0],
      visaTrxNo: [''],
      visaTrxType: [1],
      paymentType: [1],
      storeId: [1],
      totalInvoice: [0],
      saveAndPost: [true],
      totalInvoiceVatAmount: [0],
      totalInvoiceAfterVat: [0],
      totalDisc: [0],
      totalDiscRate: [0],
      totalInvoiceAfterDisc: [0],
      docProjectId: [0],
      docProjectName: [''],
      saleOfferId: [0],
      saleOfferName: [''],
      tobagoVatAmount: [0],
      saleNotAffectStorage: [true],
      salesAccountID: [0],
      salesAccountCode: [''],
      salesAccountName: [''],
      insuranceCompanyId: [0],
      insuranceCompanyName: [''],
      otherDisc: [0],
      totalInvoiceAfterVatIncluded: [0],
      workByPriceWithVat: [true],
    });
  }

  private listenToPaymentMethodChange(): void {
    this.InvoiceForm.get('paymentTypeMethod')?.valueChanges.subscribe(
      (type) => {
        if (type === '1') {
          this.InvoiceForm.patchValue({
            cash: this.totalPrice,
            visa: 0,
            visaTrxNo: '',
            paymentType: 1,
          });
        } else if (type === '2') {
          this.InvoiceForm.patchValue({
            cash: 0,
            visa: this.totalPrice,
            paymentType: 2,
          });
        }
      },
    );
  }

  createProductFormGroup(item: Icart): FormGroup {
    return this._formBuilder.group({
      productId: [item.ProductId],
      nameAr: [item.ProductName || ''],
      quantity: [item.Quantity],
      price: [item.Price],
      uniteId: [item.UnitId || 0],
      itemID: [item.ProductId],
      uniteName: [item.UnitName || ''],
      branchId: [1],
      priceIncludeVat: [item.Price],
      discount: [0],
      totalDisc: [0],
      discountPercent: [0],
      vat: [0],
      weight: [0],
      itemType_Sale: [1],
      offerItemchek: [0],
      productCode: [''],
      productGtin: [''],
      patchCode: [''],
      expirationDate: [''],
      totalPriceAfterVat: [item.Price * item.Quantity],
      totalPriceAfterDiscount: [item.Price * item.Quantity],
      vatAmount: [0],
      docDate: [new Date().toISOString()],
      isProductFree: [false],
      count: [0],
      isHasBonus: [false],
      isProductBonus: [false],
      notes: [''],
      tobagoVat: [0],
      tobagoVatAmount: [0],
    });
  }

  populateFormWithCartData(): void {
    const saleInvoiceDetails = this.InvoiceForm.get(
      'saleInvoiceDetails',
    ) as FormArray;
    saleInvoiceDetails.clear();

    this.cartproducts.forEach((item) => {
      saleInvoiceDetails.push(this.createProductFormGroup(item));
    });

    this.InvoiceForm.patchValue({
      clientId: this.userId,
      totalInvoice: this.totalPrice,
      totalInvoiceAfterVat: this.totalPrice,
      cash: this.totalPrice,
      visa: 0,
    });
  }

  createInvoice(): void {
  console.log('hello');
  
    if (this.InvoiceForm.invalid) {
      this.InvoiceForm.markAllAsTouched();
      this._ToastrService.error(
        this._translate.instant('cart.invoice.validationError'),
      );
      return;
    }

    const formValue = { ...this.InvoiceForm.value };

    formValue.cash = this._HelperService.formatAmount(formValue.cash);
    formValue.visa = this._HelperService.formatAmount(formValue.visa);

    formValue.docDate = this._HelperService.formatDateDisplay(
      formValue.docDate,
    );

    formValue.banquetDate = this._HelperService.formatDateDisplay(
      formValue.banquetDate,
    );

    const totalPaid = formValue.cash + formValue.visa;
    const remainingDebt = this.totalPrice - totalPaid;

    formValue.debt =
      remainingDebt > 0 ? this._HelperService.formatAmount(remainingDebt) : 0;

    formValue.paymentType =
      formValue.cash > 0 && formValue.visa > 0 ? 3 : formValue.visa > 0 ? 2 : 1;

    let createdInvoiceId: string = '';
    this._loadingService.start();

    this._PaymentService
      .createPaymentInvoice(formValue)
      .pipe(
        switchMap((res: any) => {
          if (res?.IsSuccess) {
            createdInvoiceId = res?.Obj?.Id || res?.Id || '';
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
        next: () => {
          this._ToastrService.success(
            this._translate.instant('cart.invoice.successMsg'),
          );
          localStorage.removeItem('cartItems');
          this._router.navigate(['/order-success'], {
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
