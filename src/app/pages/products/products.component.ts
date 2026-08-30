import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { ItemUnit } from '../../Core/Interfaces/iall-categories';
import { Iproducts } from '../../Core/Interfaces/iproducts';
import { AllProductsService } from '../../Core/Services/all-products.service';
import { CartService } from '../../Core/Services/cart.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';
import { IPagination } from '../../Shared/models/IPagination.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    NgbPaginationModule,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  pageNo = 1;
  text: string = '';
  pagination!: IPagination;
  math: Math = Math;
  decoded!: any;
  totalCount: any;
  currentUrl: any;
  allProducts = signal<Iproducts[]>([]);
  pageSize = PAGE_SIZE;
  private readonly _AllProductsService = inject(AllProductsService);
  private readonly _Router = inject(Router);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _CartService = inject(CartService);
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private readonly _LoadingService = inject(LoadingService);

  ngOnInit(): void {
    this.currentUrl = this._Router.url;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          this.decoded = jwtDecode(token);
        } catch (e) {
          console.error('Invalid token format', e);
        }
      }
    }
    this.loadItems();
  }

  get filteredItems() {
    return this.allProducts().filter(
      (item) =>
        item.NameAr?.toLowerCase().includes(this.text.toLowerCase()) ||
        item.NameEn?.toLowerCase().includes(this.text.toLowerCase()),
    );
  }

  loadItems() {
    this._LoadingService.start();

    this._AllProductsService.getPagedItem(this.pageNo, PAGE_SIZE).subscribe({
      next: (res) => {
        this.allProducts.set(res.Obj.PagedResult);
        this.totalCount = res.Obj.TotalCount;
        this.setData(res.Obj);
        this._LoadingService.stop();
      },
      error: (err) => {
        this._LoadingService.stop();
        console.error(err);
      },
    });
  }

  setData(res: any): void {
    this.pagination = {
      PageSize: PAGE_SIZE,
      TotalCount: res.TotalCount,
    };
  }

  page(ev: any): void {
    this.pageNo = ev;
    this.loadItems();
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

  addToCart(productId: number, price: number, quantity: number = 1): void {
    const product = this.filteredItems.find((item) => item.Id === productId);
    if (product && this.isOutOfStock(product)) {
      this._ToastrService.warning('هذا المنتج غير متوفر حالياً');
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      this._ToastrService.error('من فضلك اعد تسجيل الدخول!');
      localStorage.removeItem('userToken');
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
          this._ToastrService.success(res.Message || 'تمت الإضافة بنجاح');
        },
        error: (err) => {
          console.error('Error while adding:', err);
          this._ToastrService.error(err.Message || 'حدث خطأ في الإضافة');
        },
      });
    } catch (error) {
      this._ToastrService.error('جلسة تسجيل الدخول انتهت');
      this._Router.navigate(['/login']);
    }
  }
}
