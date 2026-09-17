import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CategoriesService } from '../../Core/Services/categories.service';
import { LoadingService } from '../../Core/Services/loading.service';
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
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _LoadingService = inject(LoadingService);
  groups: WritableSignal<any[]> = signal([]);
  pagination?: IPagination;

  searchTerm = signal<string>('');
  private fetchSub?: Subscription;

  pageNo = 1;
  pageSize = PAGE_SIZE;

  ngOnInit(): void {
    this.loadCategories();
  }

  get text(): string {
    return this.searchTerm();
  }
  set text(value: string) {
    this.searchTerm.set(value);
  }

  filteredItems = computed(() => {
    const query = this.searchTerm().toLowerCase().trim();
    if (!query) return this.groups();

    return this.groups().filter((category) =>
      category.NameAr?.toLowerCase().includes(query),
    );
  });

  loadCategories(): void {
    this._LoadingService.start();
    this.fetchSub?.unsubscribe();

    this.fetchSub = this._CategoriesService.getAllCategories().subscribe({
      next: (res) => {
        this.groups.set(res.Obj.Groups || []);
        this._LoadingService.stop();
      },
      error: (err) => {
        console.error(err);
        this._LoadingService.stop();
      },
    });
  }

  page(ev: number): void {
    this.pageNo = ev;
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.fetchSub?.unsubscribe();
  }
}
