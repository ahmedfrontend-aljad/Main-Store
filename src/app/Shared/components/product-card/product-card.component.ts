import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Item, ItemUnit } from '../../../Core/Interfaces/iall-categories';
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

  private readonly _Router = inject(Router);
  private readonly _ToastrService = inject(ToastrService);

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken');
  }

  openDetails(): void {
    if (this.isLoggedIn()) {
      this._Router.navigate(['/details', this.product.Id]);
    } else {
      this._ToastrService.warning('يجب تسجيل الدخول لإتمام هذه العملية');

      this._Router.navigate(['/auth/login']);
    }
  }

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

  getProductPrice(product: Item): number {
    return product.ItemUnits && product.ItemUnits.length > 0
      ? product.ItemUnits[0].Price
      : 0;
  }

  getProductImage(product: Item): string {
    if (this.hasImages(product)) {
      const unit = product.ItemUnits.find(
        (u) => u.ItemImages && u.ItemImages.length > 0,
      );
      return unit?.ItemImages[0]?.Image || '';
    }
    return '';
  }

  hasImages(product: Item): boolean {
    return (
      product.ItemUnits?.some(
        (u: ItemUnit) => u.ItemImages && u.ItemImages.length > 0,
      ) ?? false
    );
  }
}
