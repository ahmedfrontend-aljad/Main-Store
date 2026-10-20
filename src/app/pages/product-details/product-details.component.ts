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
import { ToastrService } from 'ngx-toastr';
import { IitemsDetailes } from '../../Shared/Interfaces/iitems-detailes';
import { Iproducts } from '../../Shared/Interfaces/iproducts';
import { AllProductsService } from '../../Shared/Services/all-products.service';
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
  private readonly _ToastrService = inject(ToastrService);

  detailsProduct!: IitemsDetailes;
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
        if (res?.Obj) {
          this.detailsProduct = res.Obj;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this._ToastrService.error(err?.error?.Message);
        console.error(err);
      },
    });
  }
  get formattedProduct(): Iproducts {
    const item = this.detailsProduct?.item;
    const unit = item?.ItemUnits?.[0];

    return {
      Id: item?.Id ?? 0,
      ProductId: item?.ProductId ?? 0,
      ItemId: unit?.ItemId ?? item?.Id ?? 0,

      Code: unit?.Code ?? item?.Code ?? '',
      NameAr: item?.NameAr ?? '',
      NameEn: item?.NameEn ?? '',

      ItemGroupId: unit?.ItemGroupId ?? item?.ItemGroupId ?? 0,

      UnitId: unit?.UnitId ?? 1,
      ItemUnitId: unit?.Id ?? 1,
      UnitName: unit?.UnitName ?? '',

      Barcode: unit?.Barcode ?? '',
      Price: unit?.Price ?? 0,
      PriceTax: unit?.PriceTax ?? 0,
      Vat: unit?.Vat ?? item?.Vat ?? 0,

      ImagePath: '',
      Image: '',
      Description: item?.ProductDescription ?? '',
      Notes: item?.Notes ?? '',

      Quantity: this.detailsProduct?.quantity ?? 0,
    };
  }
  closeModal(): void {
    this.closeDialog.emit();
  }
}
