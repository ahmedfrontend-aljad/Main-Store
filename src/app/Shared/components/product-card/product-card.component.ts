import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AddToCartComponent } from '../add-to-cart/add-to-cart.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [AddToCartComponent, TranslateModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: any;
  @Input({ required: true }) currentUrl!: any;

  @Output() showDetails = new EventEmitter<number | string>();

  openDetails(): void {
    if (this.product?.Id) {
      this.showDetails.emit(this.product.Id);
    }
  }

  getAvailableStock(): number {
    if (this.product?.Quantity !== undefined) {
      return this.product.Quantity;
    }
    if (this.product?.ItemUnits?.length > 0) {
      const unit = this.product.ItemUnits[0];
      return unit.Quantity ?? unit.Stock ?? unit.AvailableQuantity ?? 0;
    }
    return 1;
  }

  isOutOfStock(): boolean {
    return this.getAvailableStock() <= 0;
  }

  getProductPrice(): number {
    if (this.product?.Price && this.product.Price > 0) {
      return this.product.Price;
    }
    if (this.product?.ItemUnits && this.product.ItemUnits.length > 0) {
      return this.product.ItemUnits[0].Price || 0;
    }
    return 0;
  }

  getProductImage(): string {
    return this.product?.ImagePath || this.product?.Image || '';
  }
}
