import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  forkJoin,
  of,
  Subscription,
  switchMap,
  Unsubscribable,
} from 'rxjs';
import {
  IallCategories,
  ItemUnit,
} from '../../Core/Interfaces/iall-categories';
import { Iproducts } from '../../Core/Interfaces/iproducts';
import { AllProductsService } from '../../Core/Services/all-products.service';
import { CartService } from '../../Core/Services/cart.service';
import { CategoriesService } from '../../Core/Services/categories.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { GuestAuthService } from '../../Core/Services/guest-auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly _AllProductsService = inject(AllProductsService);
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _Router = inject(Router);
  private readonly _CartService = inject(CartService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly GuestAuthService = inject(GuestAuthService);
  allProducts: WritableSignal<Iproducts[]> = signal([]);
  allcategories: WritableSignal<IallCategories[]> = signal([]);
  private subscriptions = new Subscription();
  text: string = '';
  math: Math = Math;
  destoryAllProducts!: Unsubscribable;
  destoryCategories!: Unsubscribable;
  isUser: boolean = false;
  currentUrl: string = '';

  constructor(private _spinnerInterceptor: NgxSpinnerService) {}

  customOptionsCat: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    autoplay: true,
    autoplayHoverPause: true,
    autoplayTimeout: 2000,
    rtl: true,
    smartSpeed: 1000,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    responsive: {
      0: { items: 1 },
      400: { items: 2 },
      740: { items: 3 },
      940: { items: 6 },
    },
    nav: false,
  };

  ngOnInit(): void {
    this.currentUrl = this._Router.url;
    this._spinnerInterceptor.show();

    this.subscriptions.add(
      this.GuestAuthService.ensureGuestToken()
        .pipe(
          switchMap(() => {
            const categories$ = this._CategoriesService.getAllCategories().pipe(
              catchError((error) => {
                console.error('Failed to load categories', error);
                this._ToastrService.error('فشل تحميل الأقسام');
                return of(null);
              }),
            );

            const products$ = this._AllProductsService.getPagedItem(1, 10).pipe(
              catchError((error) => {
                console.error('Failed to load products', error);
                this._ToastrService.error('فشل تحميل المنتجات');
                return of(null);
              }),
            );

            return forkJoin([categories$, products$]);
          }),
        )
        .subscribe({
          next: ([categoriesResponse, productsResponse]) => {
            if (categoriesResponse?.Obj) {
              this.allcategories.set(categoriesResponse.Obj.ItemGroups);
            }

            if (productsResponse?.Obj) {
              this.allProducts.set(productsResponse.Obj.PagedResult);
            }

            this._spinnerInterceptor.hide();
          },
          error: (err) => {
            console.error('A critical error occurred in initialization:', err);
            this._spinnerInterceptor.hide();
          },
        }),
    );
  }

  get filteredItems() {
    return this.allProducts().filter(
      (item) =>
        item.NameAr?.toLowerCase().includes(this.text.toLowerCase()) ||
        item.NameEn?.toLowerCase().includes(this.text.toLowerCase()),
    );
  }
  hasImages(product: any): boolean {
    return (
      product.ItemUnits?.some(
        (u: ItemUnit) => u.ItemImages && u.ItemImages.length > 0,
      ) ?? false
    );
  }

  addToCart(productId: number, price: number, quantity: number) {
    const product = this.filteredItems.find((item) => item.Id === productId);
    if (product && this.isOutOfStock(product)) {
      this._ToastrService.warning('هذا المنتج غير متوفر حالياً');
      return;
    }
    const userToken = localStorage.getItem('userToken');
    const guestToken = localStorage.getItem('guestToken');

    if (userToken) {
      this._spinnerInterceptor.show();
      try {
        const decoded: any = jwtDecode(userToken);
        const userId = decoded.Id;
        const dataToSend = {
          ProductId: productId,
          Price: price,
          Quantity: quantity,
          UserId: userId,
        };

        this._CartService.addToCart(dataToSend).subscribe({
          next: (response) => {
            this._spinnerInterceptor.hide();
            if (response && response.IsSuccess) {
              this._ToastrService.success(
                response.Message || 'تمت الإضافة بنجاح!',
              );
            } else {
              this._ToastrService.error(
                response.Message || 'فشل إضافة المنتج.',
              );
            }
          },
          error: (err) => {
            this._spinnerInterceptor.hide();
            this._ToastrService.error('فشل الاتصال بالخادم.');
          },
        });
      } catch (error) {
        this._spinnerInterceptor.hide();
        this._ToastrService.error('جلسة المستخدم غير صالحة.');
        this._Router.navigate(['/auth/login']);
      }
    } else if (guestToken) {
      this._ToastrService.info('سجل الدخول لإضافة المنتجات للسلة أولاً');
      setTimeout(() => {
        localStorage.removeItem('guestToken');
        this._Router.navigate(['/auth/login']);
      }, 1500);
    } else {
      this._ToastrService.error('يجب تسجيل الدخول أولاً لإضافة منتجات للسلة');
      this._Router.navigate(['/auth/login']);
    }
  }

  getProductImage(product: any): string | null {
    if (product?.ItemUnits && product.ItemUnits.length > 0) {
      for (const unit of product.ItemUnits) {
        if (unit.ItemImages && unit.ItemImages.length > 0) {
          for (const img of unit.ItemImages) {
            if (img && img.Image) {
              return img.Image;
            }
          }
        }
      }
    }

    return null;
  }

  getAvailableStock(product: any): number {
    if (product?.ItemUnits?.length > 0) {
      const unit = product.ItemUnits[0];
      return unit.Quantity ?? unit.Stock ?? unit.AvailableQuantity ?? 0;
    }
    return 0;
  }

  isOutOfStock(product: any): boolean {
    return this.getAvailableStock(product) <= 0;
  }

  ngOnDestroy(): void {
    if (this.destoryCategories) {
      this.destoryCategories.unsubscribe();
    }
    if (this.destoryAllProducts) {
      this.destoryAllProducts.unsubscribe();
    }
  }
}
