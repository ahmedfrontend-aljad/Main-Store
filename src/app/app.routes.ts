import { Routes } from '@angular/router';
import { authLoginGuard } from './Core/Guards/auth-login.guard';
import { blankGuard } from './Core/Guards/blank.guard';

export const routes: Routes = [
  // Auth Layout (Login & Register)
  {
    path: 'auth',
    loadComponent: () =>
      import('./Layouts/auth/auth.component').then((c) => c.AuthComponent),
    canActivate: [authLoginGuard],
    children: [
      { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((c) => c.LoginComponent),
        title: 'login',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/user-register/user-register.component').then(
            (c) => c.UserRegisterComponent,
          ),
        title: 'register',
      },
      {
        path: 'forgetpassword',
        loadComponent: () =>
          import('./pages/forget-password/forget-password.component').then(
            (c) => c.ForgetPasswordComponent,
          ),
        title: 'forgetPassword',
      },
    ],
  },

  // Guest Layout
  {
    path: 'guest',
    loadComponent: () =>
      import('./Layouts/guest/guest.component').then((c) => c.GuestComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((c) => c.HomeComponent),
        title: 'home',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories.component').then(
            (c) => c.CategoriesComponent,
          ),
        title: 'allCategories',
      },
      {
        path: 'details/:id',
        loadComponent: () =>
          import('./pages/product-details/product-details.component').then(
            (c) => c.ProductDetailsComponent,
          ),
        title: 'itemDetails',
      },
      {
        path: 'catDetails/:code',
        loadComponent: () =>
          import('./pages/category-details/category-details.component').then(
            (c) => c.CategoryDetailsComponent,
          ),
        title: 'categoryProducts',
      },
    ],
  },

  // Blank Layout (Protected Pages)
  {
    path: '',
    loadComponent: () =>
      import('./Layouts/blank/blank.component').then((c) => c.BlankComponent),
    canActivate: [blankGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((c) => c.HomeComponent),
        title: 'home',
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart-list/cart.component').then(
            (c) => c.CartComponent,
          ),
        title: 'cart',
      },
      {
        path: 'cart-invoice',
        loadComponent: () =>
          import('./pages/cart/cart-invoice/cart-invoice.component').then(
            (c) => c.CartInvoiceComponent,
          ),
        title: 'invoice',
      },
      {
        path: 'catDetails/:code',
        loadComponent: () =>
          import('./pages/category-details/category-details.component').then(
            (c) => c.CategoryDetailsComponent,
          ),
        title: 'categoryProducts',
      },
      {
        path: 'wishList',
        loadComponent: () =>
          import('./pages/wishlist/wishlist.component').then(
            (c) => c.WishlistComponent,
          ),
        title: 'wishList',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products.component').then(
            (c) => c.ProductsComponent,
          ),
        title: 'allProducts',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories.component').then(
            (c) => c.CategoriesComponent,
          ),
        title: 'allCategories',
      },
      {
        path: 'allOrders',
        loadComponent: () =>
          import('./pages/all-orders/all-orders.component').then(
            (c) => c.AllOrdersComponent,
          ),
        title: 'allOrders',
      },
      {
        path: 'details/:id',
        loadComponent: () =>
          import('./pages/product-details/product-details.component').then(
            (c) => c.ProductDetailsComponent,
          ),
        title: 'itemDetails',
      },
      {
        path: 'offers',
        loadComponent: () =>
          import('./pages/offers/offers.component').then(
            (c) => c.OffersComponent,
          ),
        title: 'offers',
      },
      {
        path: 'payment',
        loadComponent: () =>
          import('./pages/payment/payment.component').then(
            (c) => c.PaymentComponent,
          ),
        title: 'payment',
      },
    ],
  },

  // Not Found
  {
    path: '**',
    loadComponent: () =>
      import('./pages/notfound/notfound.component').then(
        (c) => c.NotfoundComponent,
      ),
    title: 'notFound',
  },
];
