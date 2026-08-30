import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Item, ItemUnit } from '../../Core/Interfaces/iall-categories';
import { CartService } from '../../Core/Services/cart.service';
import { CategoriesService } from '../../Core/Services/categories.service';
import { IPagination } from '../../Shared/models/IPagination.model';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';
import { LoadingService } from '../../Core/Services/loading.service';

@Component({
  selector: 'app-category-details',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslateModule, NgbPaginationModule],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss',
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _CartService = inject(CartService);
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
        const code = params.get('code');
        if (code) {
          const catSub = this._CategoriesService.getAllCategories().subscribe({
            next: (res) => {
              this._LoadingService.stop();

              const allGroups = res.Obj?.ItemGroups || [];
              const selectedGroup = allGroups.find(
                (group: any) => group.Code === code,
              );

              if (selectedGroup && selectedGroup.Item) {
                const items: Item[] = selectedGroup.Item;
                this.itemsInCategories.set(items);

                this.setData(res.Obj?.TotalCount || items.length);
              } else {
                this.itemsInCategories.set([]);
                this.setData(0);
              }
            },
            error: (err) => console.error(err),
          });
          this.subscriptions.add(catSub);
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

  getProductPrice(product: Item): number {
    return product.ItemUnits && product.ItemUnits.length > 0
      ? product.ItemUnits[0].Price
      : 0;
  }

  getProductImage(product: Item): string {
    if (this.hasImages(product)) {
      const unit = product.ItemUnits.find(
        (u) => u.ItemImages && u.ItemImages.length > 0,
      );
      return unit?.ItemImages[0]?.Image || '';
    }
    return '';
  }

  hasImages(product: Item): boolean {
    return (
      product.ItemUnits?.some(
        (u: ItemUnit) => u.ItemImages && u.ItemImages.length > 0,
      ) ?? false
    );
  }

  page(ev: number): void {
    this.pageNo = ev;
  }

  addToCart(
    unitId: number,
    price: number,
    quantity: number = 1,
    product?: any,
  ): void {
    this._LoadingService.start();
    const token = localStorage.getItem('userToken');
    if (!token) {
      this._LoadingService.stop();

      this._Router.navigate(['/login']);
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const data = {
        UserId: decoded.Id,
        ProductId: unitId,
        Quantity: quantity,
        Price: price,
      };

      this._CartService.addToCart(data).subscribe({
        next: (res) => {
          this._LoadingService.stop();

          this._ToastrService.success(
            res.Message || 'Added to cart successfully',
          );
        },
        error: (err) => {
          this._LoadingService.stop();

          this._ToastrService.error(err.error?.Message || 'An error occurred');
        },
      });
    } catch (e) {
      this._LoadingService.stop();
      this._Router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
