import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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

  allOrders: any[] = [];
  pageNo = 1;
  pageSize = PAGE_SIZE;
  deliverdOrders: any;
  filtersForm!: FormGroup;
  showClearFilters: boolean = false;
  value: string = 'tab1';

  tabs = [
    { id: 'tab1', title: 'inreview' },
    { id: 'tab2', title: 'accepted' },
    { id: 'tab3', title: 'ready' },
    { id: 'tab4', title: 'out for delevery' },
    { id: 'tab5', title: 'deleverd ' },
    { id: 'tab6', title: 'canceled ' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.getAllOrdersByStatus();
    this.getDeliverdOrders();
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

  getDeliverdOrders(): void {
    this._LoadingService.start();

    const { fromDate, toDate } = this.filtersForm.value;

    const defaultFromDate = '2021-01-01';
    const defaultToDate = new Date().toISOString().split('T')[0];

    const rawParams = {
      pageNumber: this.pageNo,
      pageSize: this.pageSize,
      fromDate: this.formatDateToISO(fromDate) || defaultFromDate,
      toDate: this.formatDateToISO(toDate) || defaultToDate,
    };

    const cleanedParams = this._HelperService.cleanNullValues(rawParams);
    console.log('API Params:', cleanedParams);
    this._DataService
      .get(`${apiUrl}/XtraAndPos_MobileLookups/GetPagedSaleInvoicesByDate`, {
        params: cleanedParams,
      })
      .pipe(finalize(() => this._LoadingService.stop()))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess || res?.isSuccess) {
            this.deliverdOrders = res.Obj;
          } else {
            this._ToastrService.error(
              res?.Message || res?.message || 'فشلت عملية جلب الطلبات المكتملة',
            );
          }
        },
        error: (err) => {
          console.error(err);
          this._ToastrService.error('حدث خطأ أثناء جلب الطلبات المكتملة');
        },
      });
  }

  getAllOrdersByStatus(): void {
    this._LoadingService.start();

    const { fromDate, toDate } = this.filtersForm.value;

    const defaultFromDate = '2021-01-01';
    const defaultToDate = new Date().toISOString().split('T')[0];

    const rawParams = {
      pageNumber: this.pageNo,
      pageSize: this.pageSize,
      fromDate: this.formatDateToISO(fromDate) || defaultFromDate,
      toDate: this.formatDateToISO(toDate) || defaultToDate,
    };

    const cleanedParams = this._HelperService.cleanNullValues(rawParams);
    console.log('API Params:', cleanedParams);
    this._DataService
      .get(
        `${apiUrl}/XtraAndPOS_SaleInvoiceReqNew/GetPagedSaleInvoiceReqByDate`,
        {
          params: cleanedParams,
        },
      )
      .pipe(finalize(() => this._LoadingService.stop()))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess || res?.isSuccess) {
            this.allOrders = res.Obj;
          } else {
            this._ToastrService.error(
              res?.Message || res?.message || 'فشلت عملية جلب الطلبات',
            );
          }
        },
        error: (err) => {
          console.error(err);
          this._ToastrService.error('حدث خطأ أثناء جلب الطلبات');
        },
      });
  }

  get hasFiltersSelected(): boolean {
    const { fromDate, toDate } = this.filtersForm.value;
    return !!fromDate || !!toDate;
  }

  applyFilter(): void {
    if (!this.hasFiltersSelected) return;
    this.showClearFilters = true;
    this.getAllOrdersByStatus();
    this.getDeliverdOrders();
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.showClearFilters = false;
    this.getAllOrdersByStatus();
    this.getDeliverdOrders();
  }
}
