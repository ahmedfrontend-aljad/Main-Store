import { CurrencyPipe } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { Icart } from '../../Core/Interfaces/icart';
import { CartService } from '../../Core/Services/cart.service';
import { LoadingService } from '../../Core/Services/loading.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [TranslateModule, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit, OnDestroy {
  isCartHasProducts: boolean = false;
  cardUserItems: WritableSignal<Icart[]> = signal([]);

  private readonly _CartService = inject(CartService);
  private readonly _Router = inject(Router);
  private readonly _TranslateService = inject(TranslateService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _LoadingService = inject(LoadingService);
  private subscriptions = new Subscription();

  totalPrice: number = 0;
  decoded!: any;

  ngOnInit(): void {
    const token = localStorage.getItem('userToken');
    if (token) {
      this.decoded = jwtDecode(token);
      localStorage.setItem('userId', this.decoded.Id);
      this.getCartItems();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getCartItems(): void {
    this._LoadingService.start();
    this.subscriptions.add(
      this._CartService.getLoggedCart(this.decoded.Id).subscribe({
        next: (res) => {
          this._LoadingService.stop();
          if (res?.IsSuccess && res?.Obj?.Items) {
            this.cardUserItems.set(res.Obj.Items);
            this.recalculateTotalPrice();
            localStorage.setItem('cartItems', JSON.stringify(res.Obj.Items));
            this.isCartHasProducts = res.Obj.Items.length > 0;
          } else {
            this.resetLocalCartState();
          }
        },
        error: (err) => {
          this._LoadingService.stop();
          console.error('Error fetching cart:', err);
          const localCart = localStorage.getItem('cartItems');
          if (localCart) {
            this.cardUserItems.set(JSON.parse(localCart));
            this.recalculateTotalPrice();
            this.isCartHasProducts = this.cardUserItems().length > 0;
          } else {
            this.resetLocalCartState();
          }
          this._ToastrService.error('فشل جلب السلة من الخادم.');
        },
      }),
    );
  }

  async deleteAllItems(): Promise<void> {
    const trans = await firstValueFrom(
      this._TranslateService.get([
        'swal.deleteTitle',
        'swal.deleteText',
        'swal.deleteConfirm',
        'swal.cancel',
        'swal.clearedTitle',
        'swal.clearedText',
      ]),
    );

    Swal.fire({
      title: trans['swal.deleteTitle'],
      text: trans['swal.deleteText'],
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: trans['swal.deleteConfirm'],
      cancelButtonText: trans['swal.cancel'],
    }).then((result) => {
      if (result.isConfirmed) {
        this._LoadingService.start();

        this.subscriptions.add(
          this._CartService.clearCart(this.decoded.Id).subscribe({
            next: (res) => {
              this._LoadingService.stop();
              this.resetLocalCartState();
              Swal.fire(
                trans['swal.clearedTitle'],
                trans['swal.clearedText'],
                'success',
              );
            },
            error: (err) => {
              this._LoadingService.stop();
              console.error('Failed to clear cart:', err);
              this._ToastrService.error(
                'Could not clear the cart. Please try again.',
              );
            },
          }),
        );
      }
    });
  }

  async deleteItem(productId: number): Promise<void> {
    const trans = await firstValueFrom(
      this._TranslateService.get([
        'swal.deleteTitle',
        'swal.deleteSingleText',
        'swal.deleteConfirm',
        'swal.cancel',
        'swal.deletedTitle',
        'swal.deletedText',
        'swal.deleteErrorTitle',
        'swal.deleteErrorText',
      ]),
    );

    Swal.fire({
      title: trans['swal.deleteTitle'],
      text: trans['swal.deleteSingleText'],
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: trans['swal.deleteConfirm'],
      cancelButtonText: trans['swal.cancel'],
    }).then((result) => {
      if (result.isConfirmed) {
        const currentCart = this.cardUserItems();
        const updatedCart = currentCart.filter(
          (i) => i.ProductId !== productId,
        );

        this._LoadingService.start();
        this.subscriptions.add(
          this._CartService
            .SyncCartFromLocal({
              cartItems: updatedCart,
              userId: this.decoded.Id,
            })
            .subscribe({
              next: (res) => {
                this._LoadingService.stop();
                if (res?.IsSuccess) {
                  this.cardUserItems.set(updatedCart);
                  this.recalculateTotalPrice();
                  localStorage.setItem(
                    'cartItems',
                    JSON.stringify(updatedCart),
                  );
                  this.isCartHasProducts = updatedCart.length > 0;

                  Swal.fire(
                    trans['swal.deletedTitle'],
                    trans['swal.deletedText'],
                    'success',
                  );
                } else {
                  this._ToastrService.error(res?.Message || 'فشل حذف المنتج.');
                }
              },
              error: (err) => {
                this._LoadingService.stop();
                console.error('Failed to delete item:', err);
                this._ToastrService.error('فشل الاتصال بالخادم.');
              },
            }),
        );
      }
    });
  }

  updateQuantityItem(action: 'plus' | 'minus', productId: number): void {
    const currentCart = this.cardUserItems();
    const productIndex = currentCart.findIndex(
      (item) => item.ProductId === productId,
    );

    if (productIndex !== -1) {
      const updatedCart = [...currentCart];
      const productToUpdate = { ...updatedCart[productIndex] };

      if (action === 'plus') {
        productToUpdate.Quantity++;
      } else if (action === 'minus') {
        if (productToUpdate.Quantity > 1) {
          productToUpdate.Quantity--;
        } else {
          this._ToastrService.info('لا يمكن أن تكون الكمية أقل من 1.');
          return;
        }
      }

      updatedCart[productIndex] = productToUpdate;

      this.subscriptions.add(
        this._CartService
          .SyncCartFromLocal({
            cartItems: updatedCart,
            userId: this.decoded.Id,
          })
          .subscribe({
            next: (res) => {
              if (res?.IsSuccess) {
                this.cardUserItems.set(updatedCart);
                this.recalculateTotalPrice();
                localStorage.setItem('cartItems', JSON.stringify(updatedCart));
                this._ToastrService.success('تم تحديث الكمية بنجاح.');
              } else {
                this._ToastrService.error(res?.Message || 'فشل تحديث الكمية.');
              }
            },
            error: (err) => {
              console.error('Failed to update quantity:', err);
              this._ToastrService.error('فشل الاتصال بالخادم لتحديث الكمية.');
            },
          }),
      );
    }
  }

  async paymentMethods(): Promise<void> {
    const trans = await firstValueFrom(
      this._TranslateService.get([
        'swal.paymentTitle',
        'swal.paymentText',
        'swal.cash',
        'swal.visa',
        'swal.cancel',
      ]),
    );

    Swal.fire({
      title: trans['swal.paymentTitle'],
      text: trans['swal.paymentText'],
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: trans['swal.cash'],
      denyButtonText: trans['swal.visa'],
      cancelButtonText: trans['swal.cancel'],
      confirmButtonColor: '#28a745',
      denyButtonColor: '#007bff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.goToPayment('cash');
      } else if (result.isDenied) {
        this._Router.navigate(['/cart-invoice']);
      }
    });
  }

  goToPayment(method: 'cash' | 'visa'): void {
    this._Router.navigate(['/payment'], { queryParams: { method } });
  }

  recalculateTotalPrice(): void {
    this.totalPrice = this.cardUserItems().reduce((total, item) => {
      return total + item.Price * item.Quantity;
    }, 0);
  }

  private resetLocalCartState(): void {
    this.cardUserItems.set([]);
    this.recalculateTotalPrice();
    localStorage.removeItem('cartItems');
    this.isCartHasProducts = false;
  }
}
