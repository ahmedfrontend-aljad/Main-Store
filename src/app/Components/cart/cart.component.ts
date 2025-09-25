import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ItemUnit } from '../../Core/Interfaces/iall-categories';
import { Icart } from '../../Core/Interfaces/icart';
import { CartService } from '../../Core/Services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [TranslateModule, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  isCartHasProducts: boolean = false;
  cardUserItems: WritableSignal<Icart[]> = signal([]);
  private readonly _CartService = inject(CartService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private readonly _Router = inject(Router);
  totalPrice: number = 0;
  ngOnInit(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const token = localStorage.getItem('userToken');
      const decoded: any = jwtDecode(token!);
      console.log(decoded);

      this._CartService.getLoggedCart(decoded.Id).subscribe({
        next: (res) => {
          console.log(res.Obj);
          this.cardUserItems.set(res.Obj.Items);
          console.log(res.Obj.Items[0].Quantity);
          this.totalPrice = res.Obj.TotalPrice;
          localStorage.setItem('cartItems', JSON.stringify(res.Obj.Items));
          if (localStorage.getItem('cartItems')?.length != 0) {
            this.isCartHasProducts = true;
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  deleteAllItems() {
    console.log('Clear All Items');
    Swal.fire({
      title: 'Are you sure?',
      text: 'The product will be removed from the cart!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {});
  }

  goToPayment(method: 'cash' | 'visa') {
    this._Router.navigate(['/payment']);
    {
      queryParams: {
        method;
      }
    }
  }

  hasImages(product: any): boolean {
    return (
      product.ItemUnits?.some(
        (u: ItemUnit) => u.ItemImages && u.ItemImages.length > 0
      ) ?? false
    );
  }
}
