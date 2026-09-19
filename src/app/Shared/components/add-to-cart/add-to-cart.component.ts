import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Iproducts } from '../../../Core/Interfaces/iproducts';
import { CartService } from '../../../Core/Services/cart.service';

@Component({
  selector: 'app-add-to-cart',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.scss',
})
export class AddToCartComponent {
  @Input({ required: true }) product!: Iproducts;
  @Input() quantity!: number;

  private readonly _spinnerInterceptor = inject(NgxSpinnerService);
  private readonly _CartService = inject(CartService);
  private readonly _ToastrService = inject(ToastrService);

  getAvailableStock(): number {
    if (this.product?.Quantity !== undefined) {
      return this.product.Quantity;
    }
    if (this.product.Quantity > 0) {
      return this.product.Quantity ?? 0;
    }
    return 1;
  }

  isOutOfStock(): boolean {
    return this.getAvailableStock() <= 0;
  }

  addToCart() {
    const userId = localStorage.getItem('userId');

    const dataToSend = {
      productId: this.product.Id,
      productName: this.product.NameAr || this.product.NameEn || '',
      userId: userId,
      price: this.product.Price ?? 0,
      quantity: 1,
      unitId: 1,
      unitName: this.product.UnitName ?? '',
    };

    this._spinnerInterceptor.show();

    this._CartService.addToCart(dataToSend).subscribe({
      next: (response: any) => {
        this._spinnerInterceptor.hide();

        if (response?.IsSuccess) {
          this._ToastrService.success(response.Message);
        } else {
          this._ToastrService.error(response?.Message);
        }
      },
      error: (err: any) => {
        this._spinnerInterceptor.hide();

        const errorMessage = err?.error?.Message;
        this._ToastrService.warning(errorMessage);
      },
    });
  }
}
