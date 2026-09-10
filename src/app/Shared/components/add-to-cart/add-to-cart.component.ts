import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../../Core/Services/cart.service';

@Component({
  selector: 'app-add-to-cart',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.scss',
})
export class AddToCartComponent {
  @Input({ required: true }) product!: any;
  @Input() quantity!: number;

  private readonly _spinnerInterceptor = inject(NgxSpinnerService);
  private readonly _CartService = inject(CartService);
  private readonly _ToastrService = inject(ToastrService);

  getAvailableStock(): number {
    if (this.product?.ItemUnits?.length > 0) {
      const unit = this.product.ItemUnits[0];
      return unit.Quantity ?? unit.Stock ?? unit.AvailableQuantity ?? 0;
    }
    return 0;
  }

  isOutOfStock(): boolean {
    return this.getAvailableStock() <= 0;
  }

  addToCart() {
    console.log(this.product);

    const userId = localStorage.getItem('userId')!;

    const firstUnit = this.product?.ItemUnits?.[0];
    if (!firstUnit) {
      this._ToastrService.error('بيانات السعر غير متوفرة لهذا المنتج');
      return;
    }

    const dataToSend = {
      productId: this.product.Id,
      productName: this.product.NameAr || this.product.NameEn || '',
      userId: userId,
      price: firstUnit.Price ?? 0,
      quantity: 1,
      unitId: firstUnit.Id ?? 0,
      unitName: firstUnit.NameAr ?? '',
    };

    this._spinnerInterceptor.show();

    this._CartService.addToCart(dataToSend).subscribe({
      next: (response) => {
        this._spinnerInterceptor.hide();
        if (response && response.IsSuccess) {
          this._ToastrService.success(response.Message);
        } else {
          this._ToastrService.error(response.Message);
        }
      },
      error: (err) => {
        this._spinnerInterceptor.hide();
        this._ToastrService.error(err?.Message);
      },
    });
  }
}
