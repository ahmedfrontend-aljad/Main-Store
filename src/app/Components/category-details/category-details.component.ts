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
import { CartService } from '../../Core/Services/cart.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { ItemUnit } from '../../Core/Interfaces/iall-categories';

@Component({
  selector: 'app-category-details',
  imports: [RouterLink, FormsModule, TranslateModule],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss',
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _CartService = inject(CartService);
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
  addToCart(
    unitId: number,
    price: number,
    quantity: number = 1,
    product?: any
  ): void {
    console.log('unitId:', unitId);
    console.log('price object:', price);

    const token = localStorage.getItem('userToken');
    if (!token) {
      this._Router.navigate(['/login']);
      return;
    }

    const decoded: any = jwtDecode(token);

    const data = {
      UserId: decoded.Id,
      ProductId: unitId,
      Quantity: quantity,
      Price: price,
    };

    this._CartService.addToCart(data).subscribe({
      next: (res) => {
        this._ToastrService.success(res.Message);
        console.log('ItemUnits:', product.ItemUnits);
      },
      error: (err) => {
        this._ToastrService.error(err.Message);
      },
    });
  }

  hasImages(product: any): boolean {
    return (
      product.ItemUnits?.some(
        (u: ItemUnit) => u.ItemImages && u.ItemImages.length > 0
      ) ?? false
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
