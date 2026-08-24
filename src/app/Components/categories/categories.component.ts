import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { IallCategories } from '../../Core/Interfaces/iall-categories';
import { CategoriesService } from '../../Core/Services/categories.service';
import { TranslateModule } from '@ngx-translate/core';
import { PAGE_SIZE } from '../../Shared/constants/general.constant';
import { LoadingService } from '../../Core/Services/loading.service';
import { IPagination } from '../../Shared/models/IPagination.model';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-categories',
  imports: [FormsModule, RouterLink, TranslateModule, NgbPaginationModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  text: string = '';
  currentUrl: string = '';
  pageNo = 0;
  pageSize = PAGE_SIZE;
  allCategories: WritableSignal<IallCategories[]> = signal([]);
  private readonly subscription = new Subscription();
  pagination?: IPagination;
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _LoadingService = inject(LoadingService);
  private readonly _Router = inject(Router);

  ngOnInit(): void {
    this._LoadingService.start();
    this.currentUrl = this._Router.url;

    this.subscription.add(
      this._CategoriesService.getAllCategories().subscribe({
        next: (res) => {
          console.log(res);
          this.allCategories.set(res.Obj.ItemGroups);
          this._LoadingService.stop();
        },
        error: (err) => {
          console.log(err);
          this._LoadingService.stop();
        },
      }),
    );
  }

  page(ev: any) {
    this.pageNo = ev;
    this._CategoriesService.getAllCategories();
  }

  get filteredItems() {
    return this.allCategories().filter((category) =>
      category.NameAr?.toLowerCase().includes(this.text.toLowerCase()),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
