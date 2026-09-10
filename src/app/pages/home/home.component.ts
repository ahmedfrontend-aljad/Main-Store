import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Subscription, tap } from 'rxjs';
import { DataService } from '../../Core/Services/data.service';
import { ProductCardComponent } from '../../Shared/components/product-card/product-card.component';
import { StoreUrl } from '../../Shared/constants/api.constant';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';
import { GuestAuthService } from '../../Core/Services/guest-auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CarouselModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    ProductCardComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private readonly _TranslateService = inject(TranslateService);
  private readonly _Router = inject(Router);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _DataService = inject(DataService);
  private readonly _spinnerInterceptor = inject(NgxSpinnerService);
  private readonly _GuestAuthService = inject(GuestAuthService);

  products: any[] = [];
  categories: any[] = [];
  offers: any[] = [];

  text: string = '';
  sub!: Subscription;
  currentUrl: string = '';
  bannersData: any;
  pageNo = 1;
  PageSize = PAGE_SIZE;

  customOptionsCat: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    autoplay: true,
    autoplayHoverPause: true,
    autoplayTimeout: 3000,
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

  customOptionsBanners: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    autoplay: true,
    autoplayHoverPause: true,
    autoplayTimeout: 5000,
    smartSpeed: 900,
    dots: true,
    nav: false,
    rtl: true,
    items: 1,
    responsive: {
      0: { items: 1 },
      768: { items: 1 },
    },
  };

  async ngOnInit() {
    this.currentUrl = this._Router.url;

    await this._GuestAuthService.ensureGuestToken();

    await this.getHomeData();
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
    this._spinnerInterceptor.show();

    await firstValueFrom(
      this._DataService.get(`${StoreUrl}/Home/GetHome`).pipe(
        tap((res) => {
          this.bannersData = res?.Obj?.Banners;
          this.categories = res?.Obj?.Groups;
          this.offers = res?.Obj?.Offers;
        }),
      ),
    ).catch((error) => {
      console.error(error);
      this._ToastrService.error(error?.Message || 'Error fetching home data');
    });

    this._spinnerInterceptor.hide();
  }
}
