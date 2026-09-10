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
import { ProductCardComponent } from '../../Shared/components/product-card/product-card.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    NgbPaginationModule,
    ProductCardComponent,
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
}
