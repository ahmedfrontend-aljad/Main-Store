import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Iproducts } from '../../Core/Interfaces/iproducts';
import { DataService } from '../../Core/Services/data.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { ProductCardComponent } from '../../Shared/components/product-card/product-card.component';
import { apiUrl } from '../../Shared/constants/api.constant';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';
import { IPagination } from '../../Shared/models/IPagination.model';
import { ProductDetailsComponent } from '../product-details/product-details.component';

@Component({
  selector: 'app-category-details',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    NgbPaginationModule,
    ProductCardComponent,
    ProductDetailsComponent,
  ],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss',
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  private readonly _LoadingService = inject(LoadingService);
  private readonly _DataService = inject(DataService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _Router = inject(Router);

  private subscriptions: Subscription = new Subscription();

  pagination!: IPagination;
  currentUrl!: string;
  pageNo = signal<number>(1);
  pageSize = PAGE_SIZE;
  searchTerm = signal<string>('');
  selectedProductId: number | string | null = null;

  selectedGroupProducts = signal<Iproducts[]>([]);

  ngOnInit(): void {
    this.currentUrl = this._Router.url;
    this.getallProducts();
  }

  get text(): string {
    return this.searchTerm();
  }
  set text(val: string) {
    this.searchTerm.set(val);
  }

  getallProducts(): void {
    const sub = this._ActivatedRoute.paramMap.subscribe({
      next: (params) => {
        const routeParam = (params.get('id') || params.get('Id'))
          ?.toString()
          .trim();

        if (routeParam) {
          this._LoadingService.start();

          const apiSub = this._DataService
            .get(
              `${apiUrl}/XtraAndPOS_Store/GetItemsByGroupId?groupId=${routeParam}`,
            )
            .subscribe({
              next: (res) => {
                this._LoadingService.stop();
                if (res?.IsSuccess) {
                  const mappedItems = res.Obj.Items;
                  this.selectedGroupProducts.set(mappedItems);
                  this.setData(mappedItems.length);
                } else {
                  this.selectedGroupProducts.set([]);
                  this._ToastrService.error(res?.Message);
                }
              },
              error: (err) => {
                this._LoadingService.stop();
                this.selectedGroupProducts.set([]);
                console.error(err);
                this._ToastrService.error(err?.error?.Message);
              },
            });

          this.subscriptions.add(apiSub);
        }
      },
    });

    this.subscriptions.add(sub);
  }

  filteredItems = computed(() => {
    const products = this.selectedGroupProducts();
    const query = this.searchTerm().trim().toLowerCase();
    const currentPage = this.pageNo();

    const filtered = products.filter((item) => {
      const matchAr = item.NameAr?.toLowerCase().includes(query);
      const matchEn = item.NameEn?.toLowerCase().includes(query);
      return matchAr || matchEn;
    });

    if (this.pagination) {
      this.pagination.TotalCount = filtered.length;
    }

    const startIndex = (currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  });

  setData(totalCount: number): void {
    this.pagination = {
      PageSize: this.pageSize,
      TotalCount: totalCount,
    };
  }

  page(ev: number): void {
    this.pageNo.set(ev);
  }

  openProductModal(id: number | string): void {
    this.selectedProductId = id;
  }

  closeProductModal(): void {
    this.selectedProductId = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
