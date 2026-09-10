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
import { finalize } from 'rxjs';
import { DataService } from '../../Core/Services/data.service';
import { HelperService } from '../../Core/Services/helper.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { StoreInputComponent } from '../../Shared/components/store-input/store-input.component';
import { apiUrl } from '../../Shared/constants/api.constant';
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
  public readonly translate = inject(TranslateService);

  allOrders: any[] = [];
  deliverdOrders: any[] = [];

  pageNo = 1;
  pageSize = PAGE_SIZE;
  totalOrdersCount = 0;
  totalDeliveredCount = 0;

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

  private formatDateToISO(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  }

  loadAllData(): void {
    this.getAllOrdersByStatus();
    this.getDeliverdOrders();
  }

  getDeliverdOrders(): void {
    const { fromDate, toDate } = this.filtersForm.value;

    const rawParams = {
      pageNumber: this.pageNo,
      pageSize: this.pageSize,
      fromDate: this.formatDateToISO(fromDate),
      toDate: this.formatDateToISO(toDate),
    };

    const cleanedParams = this._HelperService.cleanNullValues(rawParams);

    this._DataService
      .get(`${apiUrl}/XtraAndPos_MobileLookups/GetPagedSaleInvoicesByDate`, {
        params: cleanedParams,
      })
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess) {
            this.deliverdOrders = res.Obj?.trx || [];
            this.totalDeliveredCount = res.Obj?.totalCount;
          } else {
            this._ToastrService.error(res?.Message);
          }
        },
        error: (err) => {
          console.error(err);
          this._ToastrService.error(err?.Message || err?.message);
        },
      });
  }

  getAllOrdersByStatus(): void {
    this._LoadingService.start();

    const { fromDate, toDate } = this.filtersForm.value;
    const defaultToDate = new Date().toISOString().split('T')[0];

    const rawParams = {
      pageNumber: this.pageNo,
      pageSize: this.pageSize,
      fromDate: this.formatDateToISO(fromDate),
      toDate: this.formatDateToISO(toDate) || defaultToDate,
    };

    const cleanedParams = this._HelperService.cleanNullValues(rawParams);

    this._DataService
      .get(
        `${apiUrl}/XtraAndPOS_SaleInvoiceReqNew/GetPagedSaleInvoiceReqByDate`,
        { params: cleanedParams },
      )
      .pipe(finalize(() => this._LoadingService.stop()))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess) {
            this.allOrders = res.Obj?.trx || [];
            this.totalOrdersCount = res.Obj?.totalCount;
          } else {
            this._ToastrService.error(res?.Message);
          }
        },
        error: (err) => {
          console.error(err);
          this._ToastrService.error(err?.Message || err?.message);
        },
      });
  }

  getOrdersByStatus(status: number): any[] {
    if (status === 5) {
      return this.deliverdOrders || [];
    }
    if (!this.allOrders) return [];
    return this.allOrders.filter((order) => order.Status === status);
  }

  getTotalCountByStatus(status: number): number {
    return status === 5 ? this.totalDeliveredCount : this.totalOrdersCount;
  }

  get currentLang(): string {
    return this.translate.currentLang || 'ar';
  }

  get hasFiltersSelected(): boolean {
    const { fromDate, toDate } = this.filtersForm.value;
    return !!fromDate || !!toDate;
  }

  page(pageIndex: number): void {
    this.pageNo = pageIndex;
    this.loadAllData();
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
