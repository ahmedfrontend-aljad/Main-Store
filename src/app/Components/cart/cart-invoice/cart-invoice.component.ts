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
import { Icart } from '../../../Core/Interfaces/icart';
import { CartService } from '../../../Core/Services/cart.service';

@Component({
  selector: 'app-cart-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './cart-invoice.component.html',
  styleUrl: './cart-invoice.component.scss',
})
export class CartInvoiceComponent implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _cartService = inject(CartService);
  private readonly _toastr = inject(ToastrService);
  private readonly _translate = inject(TranslateService);
  private readonly _router = inject(Router);

  cartproducts: Icart[] = [];
  InvoiceForm!: FormGroup;
  totalPrice: number = 0;
  userId: string | null = null;

  ngOnInit(): void {
    this.initInvoiceForm();

    const token = localStorage.getItem('userToken');
    if (!token) {
      this._toastr.error('User not logged in!');
      this._router.navigate(['/auth/login']);
      return;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      this.userId = decodedToken.Id || decodedToken.id;
    } catch (error) {
      this._toastr.error('Invalid token. Please log in again.');
      this._router.navigate(['/auth/login']);
      return;
    }

    if (!this.userId) {
      this._toastr.error('Invalid token: User ID not found.');
      return;
    }

    this._cartService.getLoggedCart(this.userId).subscribe({
      next: (res) => {
        if (res?.Obj?.Items?.length > 0) {
          this.cartproducts = res.Obj.Items;
          this.totalPrice = res.Obj.TotalPrice;
          this.populateFormWithCartData();
        } else {
          this._toastr.info('Your cart is empty.');
          this.cartproducts = [];
          this.totalPrice = 0;
        }
      },
      error: (err) => {
        console.error(err);
        this._toastr.error('Failed to load cart data.');
      },
    });
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
      expirationDate: [new Date().toISOString()],
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

  initInvoiceForm() {
    this.InvoiceForm = this._formBuilder.group({
      clienName: ['', Validators.required],
      salesManId: [0],
      salesManName: [''],
      id: [0],
      serial: [''],
      branchId: [1],
      posType: [1],
      banquetDate: [new Date().toISOString().split('T')[0]],
      driverId: [0],
      cash: [0, [Validators.required, Validators.min(0)]],
      visa: [0, [Validators.required, Validators.min(0)]],
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
      paymentType: [0],
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

  populateFormWithCartData(): void {
    const saleInvoiceDetails = this.InvoiceForm.get(
      'saleInvoiceDetails'
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
    });
  }

  createInvoice(): void {
    if (this.InvoiceForm.invalid) {
      this.InvoiceForm.markAllAsTouched();
      this._toastr.error(
        this._translate.instant('cart.invoice.validationError')
      );
      return;
    }

    const formValue = { ...this.InvoiceForm.value };

    formValue.cash = parseFloat(formValue.cash) || 0;
    formValue.visa = parseFloat(formValue.visa) || 0;

    formValue.docDate = new Date(formValue.docDate).toISOString();
    formValue.banquetDate = new Date(formValue.banquetDate).toISOString();

    const totalPaid = formValue.cash + formValue.visa;
    const remainingDebt = this.totalPrice - totalPaid;

    formValue.debt =
      remainingDebt > 0 ? parseFloat(remainingDebt.toFixed(2)) : 0;

    formValue.paymentType =
      formValue.cash > 0 && formValue.visa > 0 ? 3 : formValue.visa > 0 ? 2 : 1;

    console.log(
      'Final Payload Sent to Server (After DEBT Correction):',
      JSON.stringify(formValue, null, 2)
    );

    this._cartService.createMoyasarInvoice(formValue).subscribe({
      next: (res) => {
        this._toastr.success(
          this._translate.instant('cart.invoice.successMsg')
        );
        this._router.navigate(['/order-success']);
      },
      error: (err) => {
        console.error('Error creating invoice:', err);
        console.error('Error Body:', err.error);
        const errorMsg =
          err?.error?.Message ||
          this._translate.instant('cart.invoice.errorMsg');
        this._toastr.error(errorMsg);
      },
    });
  }
}
