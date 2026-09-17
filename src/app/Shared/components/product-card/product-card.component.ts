import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Iproducts } from '../../../Core/Interfaces/iproducts';
import { AddToCartComponent } from '../add-to-cart/add-to-cart.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [AddToCartComponent, TranslateModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  private readonly _ToastrService = inject(ToastrService);

  @Input({ required: true }) product!: Iproducts;
  @Input({ required: true }) currentUrl!: any;

  @Output() showDetails = new EventEmitter<number | string>();

  openDetails(): void {
    if (this.product?.Id) {
      this.showDetails.emit(this.product.Id);
    } else {
      this._ToastrService.error('خطأ اثناء عرض المنتج');
      return;
    }
  }

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
}
