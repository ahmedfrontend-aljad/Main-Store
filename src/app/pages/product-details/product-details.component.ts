import { DatePipe, NgClass } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  IitemsDetailes,
  ItemUnit,
} from '../../Core/Interfaces/iitems-detailes';
import { AllProductsService } from '../../Core/Services/all-products.service';
import { AddToCartComponent } from '../../Shared/components/add-to-cart/add-to-cart.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [TranslateModule, AddToCartComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnChanges {
  @Input() productId: any = null;
  @Output() closeDialog = new EventEmitter<void>();

  private readonly _AllProductsService = inject(AllProductsService);

  detailsProduct: any = null;
  selectedUnit: any = null;
  isLoading: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) {
      this.loadProductDetails();
    }
  }

  loadProductDetails(): void {
    this.isLoading = true;
    this._AllProductsService.getProductDetails(this.productId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.Obj?.item) {
          this.detailsProduct = res.Obj.item;

          if (this.detailsProduct?.ItemUnits?.length > 0) {
            this.selectedUnit = this.detailsProduct.ItemUnits[0];
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching details:', err);
      },
    });
  }

  closeModal(): void {
    this.closeDialog.emit();
  }
}
