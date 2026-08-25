import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { IitemsDetailes } from '../../Core/Interfaces/iitems-detailes';
import { AllProductsService } from '../../Core/Services/all-products.service';
import { CartService } from '../../Core/Services/cart.service';

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

  // تم التعديل: تعريف المتغير ليقبل undefined لحل خطأ TypeScript
  detailsProduct: IitemsDetailes | undefined;
  productId: string | null = null;

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

  selected() {
    if (history.state.from) {
      this._Router.navigateByUrl(history.state.from);
    } else {
      this._Router.navigate(['/']);
    }
  }

  addToCart(productId: number, price: number, quantity: number = 1): void {
    const token = localStorage.getItem('userToken');
    if (!token) {
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
      };

      this._CartService.addToCart(data).subscribe({
        next: (res) => {
          if (res && res.IsSuccess) {
            this._ToastrService.success(res.Message || 'تمت الإضافة بنجاح');
          } else {
            this._ToastrService.error(res.Message || 'حدث خطأ ما');
          }
        },
        error: (err) => {
          console.error('Error while adding to cart:', err);
          this._ToastrService.error('فشل الاتصال بالخادم');
        },
      });
    } catch (error) {
      this._ToastrService.error(
        'جلسة المستخدم غير صالحة، يرجى تسجيل الدخول مرة أخرى.'
      );
      this._Router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
