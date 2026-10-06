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
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Iproducts } from '../../Shared/Interfaces/iproducts';
import { DataService } from '../../Shared/Services/data.service';
import { LoadingService } from '../../Shared/Services/loading.service';
import { ProductCardComponent } from '../../Shared/components/product-card/product-card.component';
import { apiUrl } from '../../Shared/constants/api.constant';
import { ProductDetailsComponent } from '../product-details/product-details.component';

@Component({
  selector: 'app-category-details',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
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

  currentUrl!: string;
  searchTerm = signal<string>('');
  selectedProductId: number | string | null = null;

  selectedGroupProducts = signal<Iproducts[]>([]);

  filteredItems = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    return this.selectedGroupProducts().filter(
      (item) =>
        item.NameAr?.toLowerCase().includes(query) ||
        item.NameEn?.toLowerCase().includes(query),
    );
  });

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
                  this.selectedGroupProducts.set(res.Obj?.Items || []);
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
