import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CategoriesService } from '../../Core/Services/categories.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-category-details',
  imports: [RouterLink, FormsModule, TranslateModule],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss',
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _Router = inject(Router);
  currentUrl: string = '';
  itemsInCategories: WritableSignal<any[]> = signal([]);
  text: string = '';
  math: Math = Math;

  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.currentUrl = this._Router.url;

    const sub = this._ActivatedRoute.paramMap.subscribe({
      next: (params) => {
        const code = params.get('code');
        if (code) {
          const catSub = this._CategoriesService.getAllCategories().subscribe({
            next: (res) => {
              const allGroups = res.Obj.ItemGroups;
              const selectedGroup = allGroups.find(
                (group: any) => group.Code === code
              );

              if (selectedGroup) {
                this.itemsInCategories.set(selectedGroup.Item);
              }
            },
            error: (err) => console.log(err),
          });
          this.subscriptions.add(catSub);
        }
      },
    });

    this.subscriptions.add(sub);
  }

  get filteredItems() {
    return this.itemsInCategories().filter((product) =>
      product.NameEn?.toLowerCase().includes(this.text.toLowerCase())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
