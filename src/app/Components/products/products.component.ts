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
import { Iproducts } from '../../Core/Interfaces/iproducts';
import { AllProductsService } from '../../Core/Services/all-products.service';
import { PaginationComponent } from '../../Shared/components/pagination/pagination.component';
import { Unsubscribable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

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
  currentUrl: string = '';

  allProducts: WritableSignal<Iproducts[]> = signal([]);
  pageNumber: number = 1;
  pageSize: number = 50;
  totalCount: number = 0;
  destoryAllData!: Unsubscribable;

  ngOnInit(): void {
    this.currentUrl = this._Router.url;

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
        },
        error: (err) => console.log(err),
      });
  }

  pagePagnation(page: number): void {
    this.pageNumber = page;
    this.loadItems();
  }
}
