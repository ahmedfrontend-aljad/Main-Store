import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import {
  IitemsDetailes,
  ItemUnit,
} from '../../Core/Interfaces/iitems-detailes';
import { AllProductsService } from '../../Core/Services/all-products.service';
import { CartService } from '../../Core/Services/cart.service';
import { LoadingService } from '../../Core/Services/loading.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [DatePipe, TranslateModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private readonly _Router = inject(Router);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _AllProductsService = inject(AllProductsService);
  private readonly _CartService = inject(CartService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _LoadingService = inject(LoadingService);

  detailsProduct: IitemsDetailes | undefined;
  productId: string | null = null;

  selectedImage: string | null = null;
  selectedUnit: ItemUnit | null = null;

  private subscription = new Subscription();

  ngOnInit(): void {
    const routeSub = this._ActivatedRoute.paramMap.subscribe({
      next: (p) => {
        this.productId = p.get('id');

        const productSub = this._AllProductsService
          .getProductDetails(this.productId)
          .subscribe({
            next: (res) => {
              this.detailsProduct = res.Obj.item;

              if (
                this.detailsProduct?.ItemUnits &&
                this.detailsProduct.ItemUnits.length > 0
              ) {
                this.selectedUnit = this.detailsProduct.ItemUnits[0];

                if (
                  this.selectedUnit.ItemImages &&
                  this.selectedUnit.ItemImages.length > 0
                ) {
                  this.selectedImage = this.selectedUnit.ItemImages[0].Image;
                }
              }
            },
            error: (err) => {
              console.error('Error fetching product details:', err);
            },
          });

        this.subscription.add(productSub);
      },
    });

    this.subscription.add(routeSub);
  }

  changeMainImage(imgBase64: string) {
    this.selectedImage = imgBase64;
  }

  selectUnit(unit: ItemUnit) {
    this.selectedUnit = unit;
    if (
      unit.ItemImages &&
      unit.ItemImages.length > 0 &&
      unit.ItemImages[0].Image
    ) {
      this.selectedImage = unit.ItemImages[0].Image;
    }
  }

  selected() {
    if (history.state.from) {
      this._Router.navigateByUrl(history.state.from);
    } else {
      this._Router.navigate(['/']);
    }
  }

  addToCart(productId: number, price: number, quantity: number = 1): void {
    this._LoadingService.start();
    const token = localStorage.getItem('userToken');
    if (!token) {
      this._LoadingService.stop();
      this._ToastrService.error('من فضلك قم بتسجيل الدخول أولاً!');
      this._Router.navigate(['/login']);
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const data = {
        UserId: decoded.Id,
        ProductId: productId,
        Quantity: quantity,
        Price: price,
        UnitId: this.selectedUnit?.UnitId,
      };

      this._CartService.addToCart(data).subscribe({
        next: (res) => {
          this._LoadingService.stop();

          if (res && res.IsSuccess) {
            this._ToastrService.success(res.Message || 'تمت الإضافة بنجاح');
          } else {
            this._ToastrService.error(res.Message || 'حدث خطأ ما');
          }
        },
        error: (err) => {
          this._LoadingService.stop();
          console.error('Error while adding to cart:', err);
          this._ToastrService.error('فشل الاتصال بالخادم');
        },
      });
    } catch (error) {
      this._LoadingService.stop();
      this._ToastrService.error(
        'جلسة المستخدم غير صالحة، يرجى تسجيل الدخول مرة أخرى.',
      );
      this._Router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
