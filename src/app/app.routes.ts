import { Routes } from '@angular/router';
import { authLoginGuard } from './Core/Guards/auth-login.guard';
import { blankGuard } from './Core/Guards/blank.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./Layouts/auth/auth.component').then((c) => c.AuthComponent),
    canActivate: [authLoginGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(
            (c) => c.LoginComponent,
          ),
        title: 'login',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/user-register/user-register.component').then(
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

  {
    path: '',
    loadComponent: () =>
      import('./Layouts/blank/blank.component').then((c) => c.BlankComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((c) => c.HomeComponent),
        title: 'home',
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
        path: 'offers',
        loadComponent: () =>
          import('./pages/offers/offers.component').then(
            (c) => c.OffersComponent,
          ),
        title: 'offers',
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

      {
        path: 'cart',
        canActivate: [blankGuard],
        loadComponent: () =>
          import('./pages/cart/cart.component').then((c) => c.CartComponent),
        title: 'cart',
      },

      {
        path: 'wishList',
        canActivate: [blankGuard],
        loadComponent: () =>
          import('./pages/wishlist/wishlist.component').then(
            (c) => c.WishlistComponent,
          ),
        title: 'wishList',
      },
      {
        path: 'allOrders',
        canActivate: [blankGuard],
        loadComponent: () =>
          import('./pages/all-orders/all-orders.component').then(
            (c) => c.AllOrdersComponent,
          ),
        title: 'allOrders',
      },
      {
        path: 'payment',
        canActivate: [blankGuard],
        loadComponent: () =>
          import('./pages/payment/payment.component').then(
            (c) => c.paymentComponent,
          ),
        title: 'payment',
      },
      {
        path: 'profile',
        canActivate: [blankGuard],
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (c) => c.ProfileComponent,
          ),
        title: 'profile',
      },
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./pages/notfound/notfound.component').then(
        (c) => c.NotfoundComponent,
      ),
    title: 'notFound',
  },
];
