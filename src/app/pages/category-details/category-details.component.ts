import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Item } from '../../Core/Interfaces/iall-categories';
import { CategoriesService } from '../../Core/Services/categories.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { ProductCardComponent } from '../../Shared/components/product-card/product-card.component';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';
import { IPagination } from '../../Shared/models/IPagination.model';

@Component({
  selector: 'app-category-details',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    NgbPaginationModule,
    ProductCardComponent,
  ],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss',
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _Router = inject(Router);
  private readonly _LoadingService = inject(LoadingService);

  pagination!: IPagination;
  pageNo = 1;
  pageSize = PAGE_SIZE;
  currentUrl: string = '';
  itemsInCategories: WritableSignal<Item[]> = signal([]);
  text: string = '';

  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.currentUrl = this._Router.url;
    this.getallProducts();
  }

  getallProducts() {
    this._LoadingService.start();

    const sub = this._ActivatedRoute.paramMap.subscribe({
      next: (params) => {
        const routeParam = params.get('code')?.toString().trim();

        if (routeParam) {
          const catSub = this._CategoriesService.getAllCategories().subscribe({
            next: (res) => {
              this._LoadingService.stop();

              const allGroups = res?.Obj?.Groups || res?.Obj || [];

              const selectedGroup = allGroups.find(
                (group: any) =>
                  group.Code?.toString() === routeParam ||
                  group.Id?.toString() === routeParam,
              );

              if (selectedGroup && selectedGroup.Items) {
                const items: Item[] = selectedGroup.Items;
                this.itemsInCategories.set(items);
                this.setData(items.length);
              } else {
                this.itemsInCategories.set([]);
                this.setData(0);
              }
            },
            error: (err) => {
              console.error(err);
              this._LoadingService.stop();
            },
          });
          this.subscriptions.add(catSub);
        } else {
          this._LoadingService.stop();
        }
      },
    });

    this.subscriptions.add(sub);
  }

  setData(totalCount: number): void {
    this.pagination = {
      PageSize: this.pageSize,
      TotalCount: totalCount,
    };
  }

  get filteredItems(): Item[] {
    const searchText = this.text.trim().toLowerCase();
    let items = this.itemsInCategories();

    if (searchText) {
      items = items.filter((product) => {
        const matchAr = product.NameAr?.toLowerCase().includes(searchText);
        const matchEn = product.NameEn?.toLowerCase().includes(searchText);
        return matchAr || matchEn;
      });
    }

    if (this.pagination) {
      this.pagination.TotalCount = items.length;
    }

    const startIndex = (this.pageNo - 1) * this.pageSize;
    return items.slice(startIndex, startIndex + this.pageSize);
  }

  page(ev: number): void {
    this.pageNo = ev;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
