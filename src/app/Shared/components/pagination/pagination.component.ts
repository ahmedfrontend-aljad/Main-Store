import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { AllProductsService } from '../../../Core/Services/all-products.service';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent implements OnInit {
  private readonly _AllProductsService = inject(AllProductsService);

  totalPages: number[] = [];
  pageNumber: number = 1;
  pageSize: number = 50;

  @Output() pageChanged = new EventEmitter<number>();

  ngOnInit(): void {
    this._AllProductsService
      .getPagedItem(this.pageNumber, this.pageSize)
      .subscribe({
        next: (res) => {
          const pages = Math.ceil(res.Obj.TotalCount / this.pageSize);
          this.totalPages = Array.from({ length: pages }, (_, i) => i + 1);

          console.log('total Pages', this.totalPages);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages.length) return;

    this.pageNumber = page;
    this.pageChanged.emit(this.pageNumber);
  }
}
