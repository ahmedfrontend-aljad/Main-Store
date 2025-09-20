import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Subscription, Unsubscribable } from 'rxjs';
import { IallCategories } from '../../Core/Interfaces/iall-categories';
import { Iproducts } from '../../Core/Interfaces/iproducts';
import { AllProductsService } from '../../Core/Services/all-products.service';
import { CategoriesService } from '../../Core/Services/categories.service';
import { spinnerInterceptor } from '../../Core/Interceptors/spinner.interceptor';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarouselModule, FormsModule, RouterLink, TranslateModule ,],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly _AllProductsService = inject(AllProductsService);
  private readonly _CategoriesService = inject(CategoriesService);
  allProducts: WritableSignal<Iproducts[]> = signal([]);
  allcategories: WritableSignal<IallCategories[]> = signal([]);
  private subscriptions = new Subscription();
  text: string = '';
  math: Math = Math;
  destoryAllProducts!: Unsubscribable;
  destoryCategories!: Unsubscribable;

  constructor(private _spinnerInterceptor: NgxSpinnerService){

  }

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
    this._spinnerInterceptor.show();
    this.subscriptions.add(
      this._CategoriesService.getAllCategories().subscribe({
        next: (res) => {
          let data = res.Obj.ItemGroups
          this.allcategories.set(data);
          this._spinnerInterceptor.hide();
        },
        error: (err) => {
          console.log(err);
          this._spinnerInterceptor.hide();
        },
      })
    );

    this.subscriptions.add(
      this._AllProductsService.getPagedItem(1, 20).subscribe({
        next: (res) => this.allProducts.set(res.Obj.PagedResult),
        error: (err) => console.log(err),
      })
    );
  }

  get filteredItems() {
    return this.allProducts().filter(
      (item) =>
        item.NameAr?.toLowerCase().includes(this.text.toLowerCase()) ||
        item.NameEn?.toLowerCase().includes(this.text.toLowerCase())
    );
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
