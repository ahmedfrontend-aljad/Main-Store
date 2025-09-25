import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Unsubscribable } from 'rxjs';
import { Iproducts } from '../../Core/Interfaces/iproducts';
import { AllProductsService } from '../../Core/Services/all-products.service';
import { CartService } from '../../Core/Services/cart.service';
import { PaginationComponent } from '../../Shared/components/pagination/pagination.component';
import { ItemUnit } from '../../Core/Interfaces/iall-categories';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, RouterLink, PaginationComponent, TranslateModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  text: string = '';
  math: Math = Math;
  private readonly _AllProductsService = inject(AllProductsService);
  private readonly _Router = inject(Router);
  private readonly _ToastrService = inject(ToastrService);

  currentUrl: string = '';
  private readonly _CartService = inject(CartService);
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  decoded!: any;
  allProducts: WritableSignal<Iproducts[]> = signal([]);
  pageNumber: number = 1;
  pageSize: number = 50;
  totalCount: number = 0;
  destoryAllData!: Unsubscribable;

  ngOnInit(): void {
    this.currentUrl = this._Router.url;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const token = localStorage.getItem('userToken');
      this.decoded = jwtDecode(token!);
      console.log(this.decoded);
    }
    this.loadItems();
  }

  get filteredItems() {
    return this.allProducts().filter(
      (item) =>
        item.NameAr?.toLowerCase().includes(this.text.toLowerCase()) ||
        item.NameEn?.toLowerCase().includes(this.text.toLowerCase())
    );
  }

  loadItems() {
    this._AllProductsService
      .getPagedItem(this.pageNumber, this.pageSize)
      .subscribe({
        next: (res) => {
          this.allProducts.set(res.Obj.PagedResult);
          this.totalCount = res.Obj.TotalCount;
          console.log(res);
        },
        error: (err) => console.log(err),
      });
  }

  pagePagnation(page: number): void {
    this.pageNumber = page;
    this.loadItems();
  }

  addToCart(productId: number, price: number, quantity: number = 1): void {
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.error('من فضلك اعد تسجيل الدخول!');
      localStorage.removeItem('userToken');
      this._Router.navigate(['/login']);
      return;
    }

    const decoded: any = jwtDecode(token);

    const data = {
      UserId: decoded.Id,
      ProductId: productId,
      Quantity: quantity,
      Price: price,
    };

    this._CartService.addToCart(data).subscribe({
      next: (res) => {
        this._ToastrService.success(res.Message);
        console.log('Added to cart:', res);
        console.log(decoded.Id);
      },
      error: (err) => {
        console.error(' Error while adding:', err);
        this._ToastrService.error(err.Message);
      },
    });
  }
  hasImages(product: any): boolean {
    return (
      product.ItemUnits?.some(
        (u: ItemUnit) => u.ItemImages && u.ItemImages.length > 0
      ) ?? false
    );
  }
}
