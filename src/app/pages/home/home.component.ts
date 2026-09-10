import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, of, Subscription, tap } from 'rxjs';
import { IallCategories } from '../../Core/Interfaces/iall-categories';
import { Iproducts } from '../../Core/Interfaces/iproducts';
import { AllProductsService } from '../../Core/Services/all-products.service';
import { CategoriesService } from '../../Core/Services/categories.service';
import { DataService } from '../../Core/Services/data.service';
import { ProductCardComponent } from '../../Shared/components/product-card/product-card.component';
import { StoreUrl } from '../../Shared/constants/api.constant';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';
export interface APIBanners {
  TotalCount: number;
  PageNumber: number;
  PageSize: number;
  TotalPages: number;
  PagedResult: PagedResult[];
}

export interface PagedResult {
  Id: number;
  No: number;
  Guid: string;
  TitleAr: string;
  TitleEn: string;
  DescriptionAr: string;
  DescriptionEn: string;
  ImagePath: string;
  LinkUrl: string;
  DisplayOrder: number;
  StartDate: Date;
  EndDate: Date;
  IsActive: boolean;
  BranchId: number;
  Notes: string;
}

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
  private readonly _AllProductsService = inject(AllProductsService);
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _Router = inject(Router);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _DataService = inject(DataService);
  private readonly _spinnerInterceptor = inject(NgxSpinnerService);
  allProducts: WritableSignal<Iproducts[]> = signal([]);
  allcategories: WritableSignal<IallCategories[]> = signal([]);

  text: string = '';
  math: Math = Math;
  sub!: Subscription;
  isUser: boolean = false;
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

  async ngOnInit() {
    this.currentUrl = this._Router.url;
    await this.getAllHomeData();
  }

  async getAllHomeData() {
    this._spinnerInterceptor.show();

    const body = {
      pageNumber: this.pageNo,
      pageSize: PAGE_SIZE,
      searchValue: '',
    };

    await firstValueFrom(
      this._CategoriesService.getAllCategories().pipe(
        tap((res) => {
          this.allcategories.set(res?.Obj.ItemGroups);
        }),
      ),
    ).catch((error) => {
      console.error(error);
      this._ToastrService.error(error.Message);
      return of(null);
    });

    await firstValueFrom(
      this._AllProductsService.getPagedItem(this.pageNo, this.PageSize).pipe(
        tap((res) => {
          this.allProducts.set(res?.Obj.PagedResult);
        }),
      ),
    ).catch((error) => {
      console.error(error);
      this._ToastrService.error(error?.Message);
      return of(null);
    });

    await firstValueFrom(
      this._DataService.post(`${StoreUrl}/Banner/GetPaged`, body).pipe(
        tap((res) => {
          if (res?.IsSuccess) {
            this.bannersData = res.Obj?.PagedResult;
          }
        }),
      ),
    ).catch((error) => {
      console.error(error);
      return of(null);
    });

    this._spinnerInterceptor.hide();
  }

  get filteredItems() {
    return this.allProducts().filter(
      (item) =>
        item.NameAr?.toLowerCase().includes(this.text.toLowerCase()) ||
        item.NameEn?.toLowerCase().includes(this.text.toLowerCase()),
    );
  }
}
