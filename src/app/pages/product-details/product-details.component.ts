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
import { IitemsDetailes } from '../../Core/Interfaces/iitems-detailes';
import { Iproducts } from '../../Core/Interfaces/iproducts';
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
      Id: item?.Id,
      NameAr: item?.NameAr,
      NameEn: item?.NameEn,
      Price: unit?.Price ?? 0,
      Quantity: item?.Balance ?? 0,
    } as Iproducts;
  }
  closeModal(): void {
    this.closeDialog.emit();
  }
}
