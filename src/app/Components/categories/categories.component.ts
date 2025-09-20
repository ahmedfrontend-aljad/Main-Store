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

@Component({
  selector: 'app-categories',
  imports: [FormsModule, RouterLink, TranslateModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  text: string = '';
  private readonly _CategoriesService = inject(CategoriesService);
  allCategories: WritableSignal<IallCategories[]> = signal([]);
  private readonly subscription = new Subscription();
  private readonly _Router = inject(Router);
  currentUrl: string = '';

  ngOnInit(): void {
    this.currentUrl = this._Router.url;

    this.subscription.add(
      this._CategoriesService.getAllCategories().subscribe({
        next: (res) => {
          console.log(res);
          this.allCategories.set(res.Obj.ItemGroups);
        },
        error: (err) => console.log(err),
      })
    );
  }

  get filteredItems() {
    return this.allCategories().filter((category) =>
      category.NameAr?.toLowerCase().includes(this.text.toLowerCase())
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
