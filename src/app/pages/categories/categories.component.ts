import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DataService } from '../../Core/Services/data.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { apiUrl } from '../../Shared/constants/api.constant';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';
import { IPagination } from '../../Shared/models/IPagination.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, NgbPaginationModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private readonly _LoadingService = inject(LoadingService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _DataService = inject(DataService);

  groups: any[] = [];
  filteredItems: any[] = [];
  searchTerm: string = '';
  pagination?: IPagination;
  private fetchSub?: Subscription;

  pageNo = 1;
  pageSize = PAGE_SIZE;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this._LoadingService.start();
    this.fetchSub?.unsubscribe();

    this.fetchSub = this._DataService
      .get(
        `${apiUrl}/XtraAndPos_GeneralLookups/GetStoreItemGroupsAndItemsAndUnits`,
      )
      .subscribe({
        next: (res) => {
          this._LoadingService.stop();
          if (res?.IsSuccess) {
            this.groups = res.Obj?.Groups || [];
            this.filterCategories();
          } else {
            console.error(res);
            this._ToastrService.error(res.Message);
          }
        },
        error: (err) => {
          this._LoadingService.stop();
          this._ToastrService.error(err?.error?.Message);
          console.error(err);
        },
      });
  }

  filterCategories(): void {
    const query = this.searchTerm.toLowerCase().trim();
    if (!query) {
      this.filteredItems = this.groups;
      return;
    }

    this.filteredItems = this.groups.filter(
      (category: any) =>
        category.NameAr?.toLowerCase().includes(query) ||
        category.NameEn?.toLowerCase().includes(query),
    );
  }

  page(ev: number): void {
    this.pageNo = ev;
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.fetchSub?.unsubscribe();
  }
}
