import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { DataService } from '../../Core/Services/data.service';
import { StoreUrl } from '../../Shared/constants/api.constant';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../Core/Services/loading.service';
import { TranslateModule } from '@ngx-translate/core';

export type OrderStatus =
  | 'all'
  | 'completed'
  | 'pending'
  | 'under_review'
  | 'on_the_way';

export interface Order {
  id: number;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  date: string;
}
@Component({
  selector: 'app-all-orders',
  imports: [TranslateModule],
  templateUrl: './all-orders.component.html',
  styleUrl: './all-orders.component.scss',
})
export class AllOrdersComponent implements OnInit {
  private readonly _DataService = inject(DataService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _LoadingService = inject(LoadingService);
  allOrders: any[] = [];
  ngOnInit(): void {
    this.getAllOrders();
  }

  getAllOrders() {
    this._LoadingService.start();
    firstValueFrom(
      this._DataService.get(`${StoreUrl}`).pipe(
        tap((res) => {
          this._LoadingService.stop();
          if (res?.IsSuccess) {
            this.allOrders = res.Obj;
            console.log(res);
          } else {
            this._ToastrService.error(res.message);
            console.log(res);
          }
        }),
      ),
    ).catch((error) => {
      this._LoadingService.stop();
      this._ToastrService.error(error);
    });
  }
  activeTab = signal<OrderStatus>('all');

  tabs: { id: OrderStatus; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'completed', label: 'تمت' },
    { id: 'pending', label: 'معلقة' },
    { id: 'under_review', label: 'قيد المراجعة' },
    { id: 'on_the_way', label: 'في الطريق' },
  ];

  orders = signal<Order[]>([
    {
      id: 101,
      customerName: 'أحمد محمود',
      totalAmount: 450,
      status: 'completed',
      date: '2026-08-30',
    },
    {
      id: 102,
      customerName: 'أحمد محمود',
      totalAmount: 1200,
      status: 'pending',
      date: '2026-08-31',
    },
    {
      id: 103,
      customerName: 'أحمد محمود',
      totalAmount: 310,
      status: 'under_review',
      date: '2026-08-31',
    },
    {
      id: 104,
      customerName: 'أحمد محمود',
      totalAmount: 890,
      status: 'on_the_way',
      date: '2026-08-31',
    },
    {
      id: 105,
      customerName: 'أحمد محمود',
      totalAmount: 650,
      status: 'completed',
      date: '2026-08-29',
    },
  ]);

  filteredOrders = computed(() => {
    const currentTab = this.activeTab();
    if (currentTab === 'all') {
      return this.orders();
    }
    return this.orders().filter((order) => order.status === currentTab);
  });

  setTab(status: OrderStatus) {
    this.activeTab.set(status);
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'under_review':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'on_the_way':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    const tab = this.tabs.find((t) => t.id === status);
    return tab ? tab.label : status;
  }
}
