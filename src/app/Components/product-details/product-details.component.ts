import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Unsubscribable } from 'rxjs';
import { IitemsDetailes } from '../../Core/Interfaces/iitems-detailes';
import { AllProductsService } from '../../Core/Services/all-products.service';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../Core/Services/cart.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-product-details',
  imports: [DatePipe, TranslateModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  private readonly _Router = inject(Router);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _AllProductsService = inject(AllProductsService);
  private readonly _CartService = inject(CartService);
  private readonly _ToastrService = inject(ToastrService);

  detailsProduct!: IitemsDetailes;
  productId: string | null = null;

  private subscription = new Subscription();

  ngOnInit(): void {
    const routeSub = this._ActivatedRoute.paramMap.subscribe({
      next: (p) => {
        this.productId = p.get('id');

        const productSub = this._AllProductsService
          .getProductDetails(this.productId)
          .subscribe({
            next: (res) => {
              this.detailsProduct = res.Obj.item;
            },
            error: (err) => {
              console.log(err);
            },
          });

        this.subscription.add(productSub);
      },
    });

    this.subscription.add(routeSub);
  }

  selected() {
    if (history.state.from) {
      this._Router.navigateByUrl(history.state.from);
    } else {
      this._Router.navigate(['/']);
    }
  }
  addToCart(productId: number, price: number, quantity: number = 1): void {
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.error('من فضلك اعد تسجيل الدخول!');
      localStorage.removeItem('userToken');
      this._Router.navigate(['/login']);
      return;
    }

    const decoded: any = jwtDecode(token);

    const data = {
      UserId: decoded.Id,
      ProductId: productId,
      Quantity: quantity,
      Price: price,
    };

    this._CartService.addToCart(data).subscribe({
      next: (res) => {
        this._ToastrService.success(res.Message);
        console.log('Added to cart:', res);
        console.log(decoded.Id);
      },
      error: (err) => {
        console.error(' Error while adding:', err);
        this._ToastrService.error(err.Message);
      },
    });
  }
}
