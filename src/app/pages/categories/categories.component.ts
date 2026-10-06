import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CatService } from '../../Shared/Services/cat.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, NgbPaginationModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private readonly _CatService = inject(CatService);

  groups: any[] = [];
  searchTerm: string = '';

  private fetchSub?: Subscription;

  ngOnInit(): void {
    this.fetchSub = this._CatService.getCategories().subscribe({
      next: (data) => {
        this.groups = data;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      },
    });
  }

  ngOnDestroy(): void {
    this.fetchSub?.unsubscribe();
  }
}
