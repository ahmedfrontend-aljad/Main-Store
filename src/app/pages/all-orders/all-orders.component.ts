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
import { catchError, EMPTY, firstValueFrom, tap } from 'rxjs';
import { DataService } from '../../Core/Services/data.service';
import { HelperService } from '../../Core/Services/helper.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { StoreInputComponent } from '../../Shared/components/store-input/store-input.component';
import { apiUrl } from '../../Shared/constants/api.constant';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';

@Component({
  selector: 'app-all-orders',
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
    {
      id: 'tab1',
      title: 'inreview',
    },
    {
      id: 'tab2',
      title: 'accepted',
    },
    {
      id: 'tab3',
      title: 'ready',
    },
    {
      id: 'tab4',
      title: 'out for delevery',
    },
    {
      id: 'tab5',
      title: 'deleverd ',
    },
    {
      id: 'tab6',
      title: 'canceled ',
    },
  ];

  ngOnInit(): void {
    this.initForm();
    this.getAllOrdersByStatus();
    this.getDeliverdOrders();
  }

  initForm() {
    this.filtersForm = this._FormBuilder.group({
      fromDate: [''],
      toDate: [''],
    });
  }

  getDeliverdOrders() {
    this._LoadingService.start();
    const rawParams = {
      pageNumber: this.pageNo,
      pageSize: this.pageSize,
      fromDate: this.filtersForm.value.fromDate,
      toDate: this.filtersForm.value.toDate,
    };
    const cleanedParams = this._HelperService.cleanNullValues(rawParams);

    firstValueFrom(
      this._DataService
        .get(
          `${apiUrl}/XtraAndPos_MobileLookups/GetPagedSaleInvoicesByDate`,
          cleanedParams,
        )
        .pipe(
          tap((res) => {
            this._LoadingService.stop();
            if (res?.IsSuccess) {
              this.deliverdOrders = res.Obj;
            } else {
              this._ToastrService.error(res.message);
            }
          }),
          catchError((err) => {
            this._LoadingService.stop();
            this._ToastrService.error('حدث خطأ أثناء جلب الطلبات المكتملة');
            return EMPTY;
          }),
        ),
    );
  }

  getAllOrdersByStatus() {
    this._LoadingService.start();
    const rawParams = {
      pageNumber: this.pageNo,
      pageSize: this.pageSize,
      fromDate: this.filtersForm.value.fromDate,
      toDate: this.filtersForm.value.toDate,
    };
    const cleanedParams = this._HelperService.cleanNullValues(rawParams);

    firstValueFrom(
      this._DataService
        .get(
          `${apiUrl}/XtraAndPOS_SaleInvoiceReqNew/GetPagedSaleInvoiceReqByDate`,
          cleanedParams,
        )
        .pipe(
          tap((res) => {
            this._LoadingService.stop();
            if (res?.IsSuccess) {
              this.allOrders = res.Obj;
            } else {
              this._ToastrService.error(res.message);
            }
          }),
          catchError((err) => {
            this._LoadingService.stop();
            this._ToastrService.error('حدث خطأ أثناء جلب الطلبات');
            return EMPTY;
          }),
        ),
    );
  }

  get hasFiltersSelected(): boolean {
    const { fromDate, toDate } = this.filtersForm.value;
    return !!fromDate || !!toDate;
  }

  applyFilter() {
    if (!this.hasFiltersSelected) return;
    this.showClearFilters = true;
    this.getAllOrdersByStatus();
    this.getDeliverdOrders();
  }

  clearFilters() {
    this.filtersForm.reset();
    this.showClearFilters = false;
    this.getAllOrdersByStatus();
    this.getDeliverdOrders();
  }
}
