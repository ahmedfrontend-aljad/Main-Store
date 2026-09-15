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
  imports: [DatePipe, TranslateModule, AddToCartComponent, NgClass],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnChanges {
  @Input() productId: any = null;
  @Output() closeDialog = new EventEmitter<void>();

  private readonly _AllProductsService = inject(AllProductsService);

  detailsProduct: any = null;
  selectedImage: string | null = null;
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

            if (
              this.selectedUnit?.ItemImages?.length > 0 &&
              this.selectedUnit.ItemImages[0]?.Image
            ) {
              this.selectedImage = this.selectedUnit.ItemImages[0].Image;
            } else if (this.detailsProduct?.CardImage) {
              this.selectedImage = this.detailsProduct.CardImage;
            } else {
              this.selectedImage = null;
            }
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching details:', err);
      },
    });
  }

  selectUnit(unit: any): void {
    this.selectedUnit = unit;
    if (unit?.ItemImages?.length > 0 && unit.ItemImages[0]?.Image) {
      this.selectedImage = unit.ItemImages[0].Image;
    }
  }

  changeMainImage(imgBase64: string): void {
    this.selectedImage = imgBase64;
  }

  closeModal(): void {
    this.closeDialog.emit();
  }
}
