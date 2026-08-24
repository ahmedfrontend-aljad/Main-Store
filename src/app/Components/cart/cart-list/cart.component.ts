import { CurrencyPipe, NgClass } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ItemUnit } from '../../../Core/Interfaces/iall-categories';
import { Icart } from '../../../Core/Interfaces/icart';
import { CartService } from '../../../Core/Services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [TranslateModule, CurrencyPipe, NgClass],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  isCartHasProducts: boolean = false;
  cardUserItems: WritableSignal<Icart[]> = signal([]);
  private readonly _CartService = inject(CartService);
  private readonly _Router = inject(Router);
  private readonly _TranslateService = inject(TranslateService);
  private readonly _ToastrService = inject(ToastrService);
  private subscriptions = new Subscription(); // تأكد من وجود هذا السطر

  totalPrice: number = 0;
  decoded!: any;
  ngOnInit(): void {
    const token = localStorage.getItem('userToken');
    this.decoded = jwtDecode(token!);
    console.log(this.decoded);
    localStorage.setItem('userId', this.decoded.Id);

    this._CartService.getLoggedCart(this.decoded.Id).subscribe({
      next: (res) => {
        if (res.IsSuccess && res.Obj && res.Obj.Items) {
          this.cardUserItems.set(res.Obj.Items);
          this.recalculateTotalPrice();
          localStorage.setItem('cartItems', JSON.stringify(res.Obj.Items));
          this.isCartHasProducts = res.Obj.Items.length > 0;
        } else {
          this.cardUserItems.set([]);
          this.recalculateTotalPrice();
          localStorage.removeItem('cartItems');
          this.isCartHasProducts = false;
        }
      },
      error: (err) => {
        console.error('Error fetching logged cart:', err);
        const localCart = localStorage.getItem('cartItems');
        if (localCart) {
          this.cardUserItems.set(JSON.parse(localCart));
          this.recalculateTotalPrice();
          this.isCartHasProducts = this.cardUserItems().length > 0;
        } else {
          this.cardUserItems.set([]);
          this.recalculateTotalPrice();
          this.isCartHasProducts = false;
        }
        this._ToastrService.error(
          'فشل جلب السلة من الخادم. قد تكون البيانات غير محدثة.'
        );
      },
    });
  }

  async deleteAllItems() {
    const trans = await this._TranslateService
      .get([
        'swal.deleteTitle',
        'swal.deleteText',
        'swal.deleteConfirm',
        'swal.cancel',
        'swal.clearedTitle',
        'swal.clearedText',
      ])
      .toPromise();

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
        this.cardUserItems.set([]);
        this.totalPrice = 0;
        this.isCartHasProducts = false;
        localStorage.removeItem('cartItems');

        this._CartService
          .SyncCartFromLocal({
            cartItems: [],
            userId: this.decoded.Id,
          })
          .subscribe({
            next: (res) => {
              Swal.fire(
                trans['swal.clearedTitle'],
                trans['swal.clearedText'],
                'success'
              );
            },
            error: (err) => {
              console.error('Failed to clear cart on server:', err);
              this._ToastrService.error(
                'Could not clear the cart. Please try again.'
              );
            },
          });
      }
    });
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

  data = {
    cartItems: localStorage.getItem('cartItems'),
    userId: localStorage.getItem('userId'),
  };

  asyncItemsCart(): void {
    this._CartService.SyncCartFromLocal(this.data).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  payWithCash() {
    console.log('Cash');
  }
  payWithVisa() {
    console.log('Visa');
  }
  async paymentMethods() {
    const trans = await this._TranslateService
      .get([
        'swal.paymentTitle',
        'swal.paymentText',
        'swal.cash',
        'swal.visa',
        'swal.cancel',
        'swal.done',
        'swal.cashRedirect',
        'swal.visaRedirect',
      ])
      .toPromise();

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
        this.payWithCash();
      } else if (result.isDenied) {
        this.payWithVisa();
        this._Router.navigate(['/cart-invoice']);
      } else if (result.isDismissed) {
        console.log('User cancelled the payment selection.');
      }
    });
  }

  async deleteItem(productId: number) {
    const trans = await this._TranslateService
      .get([
        'swal.deleteTitle',
        'swal.deleteSingleText',
        'swal.deleteConfirm',
        'swal.cancel',
        'swal.deletedTitle',
        'swal.deletedText',
        'swal.deleteErrorTitle',
        'swal.deleteErrorText',
      ])
      .toPromise();

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
        const deletedItem = currentCart.find((i) => i.ProductId === productId);
        const updatedCart = currentCart.filter(
          (i) => i.ProductId !== productId
        );

        if (!deletedItem) return;

        const payload = {
          productId: deletedItem.ProductId,
          productName: deletedItem.ProductName,
          userId: this.decoded.Id,
          price: deletedItem.Price,
          quantity: 0,
          unitId: deletedItem.UnitId,
          unitName: deletedItem.UnitName,
        };

        this._CartService
          .SyncCartFromLocal({
            cartItems: updatedCart,
            userId: this.decoded.Id,
          })
          .subscribe({
            next: (res) => {
              if (res.IsSuccess) {
                this.cardUserItems.set(updatedCart);
                this.recalculateTotalPrice();
                localStorage.setItem('cartItems', JSON.stringify(updatedCart));
                this.asyncItemsCart();
                if (updatedCart.length === 0) {
                  this.isCartHasProducts = false;
                }

                Swal.fire(
                  trans['swal.deletedTitle'],
                  trans['swal.deletedText'],
                  'success'
                );
              } else {
                Swal.fire(
                  trans['swal.deleteErrorTitle'] || 'فشل الحذف',
                  res.Message ||
                    trans['swal.deleteErrorText'] ||
                    'لم يتم حذف المنتج من السلة.',
                  'error'
                );
              }
            },
            error: (err) => {
              console.error('Failed to delete item on server:', err);
              Swal.fire(
                trans['swal.deleteErrorTitle'] || 'خطأ في الاتصال',
                trans['swal.deleteErrorText'] ||
                  'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
                'error'
              );
            },
          });
      }
    });
  }

  recalculateTotalPrice(): void {
    this.totalPrice = this.cardUserItems().reduce((total, item) => {
      return total + item.Price * item.Quantity;
    }, 0);
  }

  updateQuantityItem(action: 'plus' | 'minus', productId: number): void {
    const currentCart = this.cardUserItems();
    const productIndex = currentCart.findIndex(
      (item) => item.ProductId === productId
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
          this._ToastrService.info(
            'لا يمكن أن تكون الكمية أقل من 1. لحذف المنتج، استخدم زر الحذف.'
          );
          return;
        }
      }

      updatedCart[productIndex] = productToUpdate;

      // الآن، نقوم بمزامنة السلة المحدثة مع الخادم
      this.subscriptions.add(
        this._CartService
          .SyncCartFromLocal({
            cartItems: updatedCart,
            userId: this.decoded.Id,
          })
          .subscribe({
            next: (res) => {
              if (res.IsSuccess) {
                this.cardUserItems.set(updatedCart);
                this.recalculateTotalPrice();
                localStorage.setItem(
                  'cartItems',
                  JSON.stringify(this.cardUserItems())
                );
                this._ToastrService.success('تم تحديث الكمية بنجاح.');
              } else {
                this._ToastrService.error(
                  res.Message || 'فشل تحديث الكمية على الخادم.'
                );
              }
            },
            error: (err) => {
              console.error('Failed to update quantity on server:', err);
              this._ToastrService.error('فشل الاتصال بالخادم لتحديث الكمية.');
            },
          })
      );
    }
  }
}
