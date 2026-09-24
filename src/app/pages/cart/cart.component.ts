import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { CartService } from '../../Shared/Services/cart.service';
import { LoadingService } from '../../Shared/Services/loading.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [TranslateModule, CurrencyPipe, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit, OnDestroy {
  private readonly _CartService = inject(CartService);
  private readonly _TranslateService = inject(TranslateService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _LoadingService = inject(LoadingService);
  private subscriptions = new Subscription();

  userId = localStorage.getItem('userId');
  isCartHasProducts: boolean = false;
  cardUserItems: any[] = [];
  totalPrice: any;

  ngOnInit(): void {
    const token = localStorage.getItem('userToken')!;
    if (token) {
      this.getCartItems();
    }
  }

  resetLocalCartState(): void {
    this.cardUserItems = [];
    localStorage.removeItem('items');
    this.isCartHasProducts = false;
  }

  getCartItems(): void {
    this._LoadingService.start();
    this.subscriptions.add(
      this._CartService.getLoggedCart(this.userId).subscribe({
        next: (res) => {
          this._LoadingService.stop();
          if (res?.IsSuccess && res?.Obj?.Items) {
            this.totalPrice = res.Obj.TotalPrice;
            this.cardUserItems = res.Obj.Items;
            localStorage.setItem('items', JSON.stringify(res.Obj.Items));
            this.isCartHasProducts = res.Obj.Items.length > 0;
          } else {
            this.resetLocalCartState();
          }
        },
        error: (err) => {
          this._LoadingService.stop();
          console.error('Error fetching cart:', err);
          const localCart = localStorage.getItem('items');
          if (localCart) {
            this.cardUserItems = JSON.parse(localCart);
            this.isCartHasProducts = this.cardUserItems.length > 0;
          } else {
            this.resetLocalCartState();
          }
          this._ToastrService.error(err.error.Message);
        },
      }),
    );
  }

  async deleteAllItems(): Promise<void> {
    const trans = await firstValueFrom(
      this._TranslateService.get([
        'deleteTitle',
        'deleteText',
        'deleteConfirm',
        'cancel',
        'clearedTitle',
        'clearedText',
      ]),
    );

    Swal.fire({
      title: trans['deleteTitle'],
      text: trans['deleteText'],
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: trans['deleteConfirm'],
      cancelButtonText: trans['cancel'],
    }).then((result) => {
      if (result.isConfirmed) {
        this._LoadingService.start();

        this.subscriptions.add(
          this._CartService.clearCart(this.userId).subscribe({
            next: (res) => {
              this._LoadingService.stop();
              this.resetLocalCartState();
              Swal.fire(trans['clearedTitle'], trans['clearedText'], 'success');
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
        'deleteTitle',
        'deleteSingleText',
        'deleteConfirm',
        'cancel',
        'deletedTitle',
        'deletedText',
        'deleteErrorTitle',
        'deleteErrorText',
      ]),
    );

    Swal.fire({
      title: trans['deleteTitle'],
      text: trans['deleteSingleText'],
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: trans['deleteConfirm'],
      cancelButtonText: trans['cancel'],
    }).then((result) => {
      if (result.isConfirmed) {
        const currentCart = this.cardUserItems;
        const updatedCart = currentCart.filter(
          (i) => i.ProductId !== productId,
        );

        this._LoadingService.start();
        this.subscriptions.add(
          this._CartService
            .SyncCartFromLocal({
              items: updatedCart,
              userId: this.userId,
            })
            .subscribe({
              next: (res) => {
                this._LoadingService.stop();
                if (res?.IsSuccess) {
                  this.cardUserItems = updatedCart;
                  localStorage.setItem('items', JSON.stringify(updatedCart));
                  this.isCartHasProducts = updatedCart.length > 0;

                  Swal.fire(
                    trans['deletedTitle'],
                    trans['deletedText'],
                    'success',
                  );
                } else {
                  this._ToastrService.error(res?.Message);
                }
              },
              error: (err) => {
                this._LoadingService.stop();
                console.error(err);
                this._ToastrService.error(err.error.Message);
              },
            }),
        );
      }
    });
  }

  updateQuantityItem(action: 'plus' | 'minus', productId: number): void {
    const currentCart = [...this.cardUserItems];
    const productIndex = currentCart.findIndex(
      (item) => item.ProductId === productId,
    );

    if (productIndex === -1) return;

    const productToUpdate = { ...currentCart[productIndex] };

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

    currentCart[productIndex] = productToUpdate;

    this.subscriptions.add(
      this._CartService
        .SyncCartFromLocal({ items: currentCart, userId: this.userId })
        .subscribe({
          next: (res) => {
            if (res?.IsSuccess) {
              this.getCartItems();
              this._ToastrService.success(res?.Message);
            } else {
              this._ToastrService.error(res?.Message);
            }
          },
          error: (err) => {
            console.error(err);
            this._ToastrService.error(err?.error?.Message);
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
