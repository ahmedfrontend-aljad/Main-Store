import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, Subscription } from 'rxjs';

import { Iproducts } from '../../Shared/Interfaces/iproducts';
import { AllProductsService } from '../../Shared/Services/all-products.service';
import { LoadingService } from '../../Shared/Services/loading.service';
import { ProductCardComponent } from '../../Shared/components/product-card/product-card.component';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';
import { ProductDetailsComponent } from '../product-details/product-details.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ProductCardComponent,
    ProductDetailsComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit, OnDestroy {
  private readonly _AllProductsService = inject(AllProductsService);
  private readonly _LoadingService = inject(LoadingService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _Router = inject(Router);

  private querySub?: Subscription;
  private fetchSub?: Subscription;

  pageNo = 1;
  pageSize = PAGE_SIZE;

  text = '';

  currentUrl: string = this._Router.url;

  allProducts = signal<Iproducts[]>([]);

  totalCount = 0;
  totalPages = 0;

  isLoading = false;
  hasMoreProducts = true;

  selectedProductId: number | string | null = null;

  availableProducts = computed(() =>
    this.allProducts().filter((p) => p.Quantity > 0),
  );

  ngOnInit(): void {
    this.querySub = this._ActivatedRoute.queryParamMap.subscribe((params) => {
      this.text = (params.get('search') || '').trim();

      this.resetAndLoad();
    });
  }

  private resetAndLoad(): void {
    this.fetchSub?.unsubscribe();

    this.isLoading = false;

    this.pageNo = 1;

    this.totalCount = 0;
    this.totalPages = 0;

    this.hasMoreProducts = true;

    this.allProducts.set([]);

    this.loadItems();
  }

  loadItems(): void {
    if (this.isLoading || !this.hasMoreProducts) {
      return;
    }

    if (this.totalPages > 0 && this.pageNo > this.totalPages) {
      this.hasMoreProducts = false;
      return;
    }

    const isFirstLoad = this.pageNo === 1;

    this.isLoading = true;

    if (isFirstLoad) {
      this._LoadingService.start();
    }

    this.fetchSub = this._AllProductsService
      .getPagedItem(this.pageNo, this.pageSize, this.text)
      .pipe(
        finalize(() => {
          this.isLoading = false;

          if (isFirstLoad) {
            this._LoadingService.stop();
          }
        }),
      )
      .subscribe({
        next: (res) => {
          const incoming: Iproducts[] = res?.Obj?.PagedResult || [];

          this.totalCount = Number(res?.Obj?.TotalCount || 0);

          if (this.totalCount > 0) {
            this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          } else {
            this.totalPages = 0;
          }

          const current = this.allProducts();

          const ids = new Set(current.map((x) => x.Id));

          const fresh = incoming.filter((x) => !ids.has(x.Id));

          if (fresh.length > 0) {
            this.allProducts.set([...current, ...fresh]);
          }

          if (incoming.length === 0) {
            this.hasMoreProducts = false;
            return;
          }

          if (incoming.length < this.pageSize) {
            this.hasMoreProducts = false;
            return;
          }

          if (this.totalPages > 0 && this.pageNo >= this.totalPages) {
            this.hasMoreProducts = false;
            return;
          }

          if (fresh.length === 0) {
            this.hasMoreProducts = false;
            return;
          }

          this.hasMoreProducts = true;

          setTimeout(() => {
            this.fillScreenIfNeeded();
          }, 50);
        },

        error: (err) => {
          console.error('Get products error:', err);

          this.hasMoreProducts = false;
        },
      });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isLoading || !this.hasMoreProducts) {
      return;
    }

    if (this.totalPages > 0 && this.pageNo >= this.totalPages) {
      this.hasMoreProducts = false;
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;

    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 800) {
      this.loadNextPage();
    }
  }

  loadNextPage(): void {
    if (this.isLoading || !this.hasMoreProducts) {
      return;
    }

    if (this.totalPages > 0 && this.pageNo >= this.totalPages) {
      this.hasMoreProducts = false;
      return;
    }

    this.pageNo++;

    this.loadItems();
  }

  private fillScreenIfNeeded(): void {
    if (this.isLoading || !this.hasMoreProducts) {
      return;
    }

    if (this.totalPages > 0 && this.pageNo >= this.totalPages) {
      this.hasMoreProducts = false;
      return;
    }

    const pageHeight = document.documentElement.scrollHeight;

    const viewportHeight = window.innerHeight;

    if (pageHeight <= viewportHeight + 100) {
      this.loadNextPage();
    }
  }

  openProductModal(id: number | string): void {
    this.selectedProductId = id;
  }

  closeProductModal(): void {
    this.selectedProductId = null;
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
    this.fetchSub?.unsubscribe();
  }
}
