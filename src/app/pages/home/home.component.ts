import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Subscription, tap } from 'rxjs';
import { register } from 'swiper/element/bundle';
import { AllProductsService } from '../../Shared/Services/all-products.service';
import { DataService } from '../../Shared/Services/data.service';
import { GuestAuthService } from '../../Shared/Services/guest-auth.service';
import { ProductCardComponent } from '../../Shared/components/product-card/product-card.component';
import { StoreUrl } from '../../Shared/constants/api.constant';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';
import { ProductDetailsComponent } from '../product-details/product-details.component';

register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    TranslateModule,
    ProductCardComponent,
    ProductDetailsComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly _TranslateService = inject(TranslateService);
  private readonly _Router = inject(Router);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _DataService = inject(DataService);
  private readonly _spinnerInterceptor = inject(NgxSpinnerService);
  private readonly _GuestAuthService = inject(GuestAuthService);
  private readonly _AllProductsService = inject(AllProductsService);

  @ViewChildren('swiperRef') swiperElements!: QueryList<ElementRef>;

  selectedProductId: number | string | null = null;
  products: any[] = [];
  categories: any[] = [];
  offers: any[] = [];

  text: string = '';
  private langSub!: Subscription;
  currentUrl: string = '';
  bannersData: any;
  pageNo = 1;
  PageSize = PAGE_SIZE;

  async ngOnInit() {
    this.currentUrl = this._Router.url;

    this.langSub = this._TranslateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        setTimeout(() => {
          this.updateSwipers();
        }, 150);
      },
    );

    this._spinnerInterceptor.show();

    try {
      await this._GuestAuthService.ensureGuestToken();
      await this.getHomeData();
    } finally {
      this._spinnerInterceptor.hide();
    }
  }

  private updateSwipers() {
    if (this.swiperElements && this.swiperElements.length > 0) {
      const isRtl = this.currentLang === 'ar';

      this.swiperElements.forEach((swiperEl) => {
        const nativeEl = swiperEl.nativeElement;

        if (nativeEl) {
          nativeEl.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

          if (nativeEl.swiper) {
            nativeEl.swiper.destroy(true, true);
          }

          if (typeof nativeEl.initialize === 'function') {
            nativeEl.initialize();
          } else if (
            nativeEl.swiper &&
            typeof nativeEl.swiper.init === 'function'
          ) {
            nativeEl.swiper.init();
          }
        }
      });
    }
  }

  get currentLang(): string {
    return (
      this._TranslateService.currentLang ||
      this._TranslateService.defaultLang ||
      'ar'
    );
  }

  get filteredItems() {
    return this.products.filter(
      (item) =>
        item.NameAr?.toLowerCase().includes(this.text.toLowerCase()) ||
        item.NameEn?.toLowerCase().includes(this.text.toLowerCase()),
    );
  }

  async getHomeData() {
    try {
      const res: any = await firstValueFrom(
        this._DataService.get(`${StoreUrl}/Home/GetHome`).pipe(
          tap((res) => {
            this.bannersData = res?.Obj?.Banners || [];
            this.categories = res?.Obj?.Groups || [];
            this.offers = res?.Obj?.Offers || [];
            this.products = res.Obj.LatestItems || [];

            setTimeout(() => this.updateSwipers(), 250);
          }),
        ),
      );
    } catch (error: any) {
      console.error(error);
      this._ToastrService.error(error?.error?.Message);
    }
  }

  openProductModal(id: number | string): void {
    this.selectedProductId = id;
  }

  closeProductModal(): void {
    this.selectedProductId = null;
  }

  get availableItems() {
    return this.filteredItems.filter((p) => p.Quantity > 0);
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }
}
