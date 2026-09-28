import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TabsModule } from 'primeng/tabs';
import { DataService } from '../../Shared/Services/data.service';
import { HelperService } from '../../Shared/Services/helper.service';
import { LoadingService } from '../../Shared/Services/loading.service';
import { StoreInputComponent } from '../../Shared/components/store-input/store-input.component';
import { apiUrl, StoreUrl } from '../../Shared/constants/api.constant';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';

@Component({
  selector: 'app-all-orders',
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    StoreInputComponent,
    TabsModule,
    NgbPaginationModule,
  ],
  templateUrl: './all-orders.component.html',
  styleUrl: './all-orders.component.scss',
})
export class AllOrdersComponent implements OnInit {
  private readonly _DataService = inject(DataService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _LoadingService = inject(LoadingService);
  private readonly _HelperService = inject(HelperService);
  public readonly _TranslateService = inject(TranslateService);

  allApprovedOrders: any[] = [];

  pageNo = 1;
  pageSize = PAGE_SIZE;
  totalOrdersCount: any;
  totalDeliveredCount: any;
  allReqOrders: any[] = [];
  totalReqOrdersCount: any;
  filtersForm!: FormGroup;
  showClearFilters: boolean = false;
  value: string = 'tab1';

  tabs = [
    { id: 'tab1', translationKey: 'STATUS_IN_REVIEW', status: 1 },
    { id: 'tab2', translationKey: 'STATUS_ACCEPTED', status: 2 },
    { id: 'tab3', translationKey: 'STATUS_READY', status: 3 },
    { id: 'tab4', translationKey: 'STATUS_OUT_FOR_DELIVERY', status: 4 },
    { id: 'tab5', translationKey: 'deliverd', status: 5 },
    { id: 'tab6', translationKey: 'STATUS_CANCELED', status: 6 },
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadAllData();
  }

  initForm(): void {
    this.filtersForm = this._FormBuilder.group({
      fromDate: [''],
      toDate: [''],
    });
  }

  get currentLang(): string {
    return this._TranslateService.currentLang || 'ar';
  }

  get hasFiltersSelected(): boolean {
    const { fromDate, toDate } = this.filtersForm.value;
    return !!fromDate || !!toDate;
  }

  page(pageIndex: number): void {
    this.pageNo = pageIndex;
    this.loadAllData();
  }

  loadAllData(): void {
    this.getApprovedOrders();
    this.getReqOrders();
  }

  getApprovedOrders(): void {
    this._LoadingService.start();
    const { fromDate, toDate } = this.filtersForm.value;
    const clientId = Number(localStorage.getItem('profileData'));
    const rawParams = {
      clientId: clientId,
      pageNumber: this.pageNo,
      pageSize: this.pageSize,
      fromDate: this._HelperService.formatDateToISO(fromDate),
      toDate: this._HelperService.formatDateToISO(toDate),
    };

    const cleanedParams = this._HelperService.cleanNullValues(rawParams);

    this._DataService
      .get(`${apiUrl}/NewStore/Invoices/GetPagedByClient`, {
        params: cleanedParams,
      })
      .subscribe({
        next: (res: any) => {
          this._LoadingService.stop();
          if (res?.IsSuccess) {
            this.allApprovedOrders = res.Obj?.trx || [];
            this.totalOrdersCount = res.Obj?.totalCount;
          } else {
            this._ToastrService.error(res?.Message);
          }
        },
        error: (err) => {
          this._LoadingService.stop();
          console.error(err);
          this._ToastrService.error(err?.error.Message);
        },
      });
  }

  getReqOrders() {
    this._LoadingService.start();
    const { fromDate, toDate } = this.filtersForm.value;
    const clientId = Number(localStorage.getItem('profileData'));
    const rawParams = {
      clientId: clientId,
      pageNumber: this.pageNo,
      pageSize: this.pageSize,
      fromDate: this._HelperService.formatDateToISO(fromDate),
      toDate: this._HelperService.formatDateToISO(toDate),
    };

    const cleanedParams = this._HelperService.cleanNullValues(rawParams);

    this._DataService
      .get(`${StoreUrl}/Order/GetClientOrders`, {
        params: cleanedParams,
      })
      .subscribe({
        next: (res: any) => {
          this._LoadingService.stop();
          if (res?.IsSuccess) {
            this.allReqOrders = res.Obj?.items || [];
            this.totalReqOrdersCount = res.Obj?.totalCount;
          } else {
            this._ToastrService.error(res?.Message);
          }
        },
        error: (err) => {
          this._LoadingService.stop();
          console.error(err);
          this._ToastrService.error(err?.error.Message);
        },
      });
  }

  getOrdersByStatus(StoreOrderStatus: number): any[] {
    if (StoreOrderStatus === 5) {
      if (!this.allApprovedOrders) return [];
      return this.allApprovedOrders.filter((order) => {
        const status = order.StoreOrderStatus ?? 5;
        return status === 5;
      });
    }

    if (!this.allReqOrders) return [];
    return this.allReqOrders.filter((order) => {
      const status = order.StoreOrderStatus ?? 1;
      return status === StoreOrderStatus;
    });
  }

  getTotalCountByStatus(status: number): number {
    if (status === 5) {
      return this.totalOrdersCount || this.getOrdersByStatus(5).length;
    }
    return this.totalReqOrdersCount || this.getOrdersByStatus(status).length;
  }

  applyFilter(): void {
    if (!this.hasFiltersSelected) return;
    this.pageNo = 1;
    this.showClearFilters = true;
    this.loadAllData();
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.pageNo = 1;
    this.showClearFilters = false;
    this.loadAllData();
  }
}
