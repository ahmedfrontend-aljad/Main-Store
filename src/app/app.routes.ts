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
          import('./Components/login/login.component').then(
            (c) => c.LoginComponent
          ),
        title: 'Login',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./Components/user-register/user-register.component').then(
            (c) => c.UserRegisterComponent
          ),
        title: 'Register',
      },
      {
        path: 'forgetpassword',
        loadComponent: () =>
          import('./Components/forget-password/forget-password.component').then(
            (c) => c.ForgetPasswordComponent
          ),
        title: 'Forget Password',
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
          import('./Components/home/home.component').then(
            (c) => c.HomeComponent
          ),
        title: 'Home',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./Components/categories/categories.component').then(
            (c) => c.CategoriesComponent
          ),
        title: 'All Categories',
      },

      {
        path: 'details/:id',
        loadComponent: () =>
          import('./Components/product-details/product-details.component').then(
            (c) => c.ProductDetailsComponent
          ),
        title: 'Item Details',
      },
      {
        path: 'catDetails/:code',
        loadComponent: () =>
          import(
            './Components/category-details/category-details.component'
          ).then((c) => c.CategoryDetailsComponent),
        title: 'Category Products',
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
          import('./Components/home/home.component').then(
            (c) => c.HomeComponent
          ),
        title: 'Home',
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./Components/cart/cart.component').then(
            (c) => c.CartComponent
          ),
        title: 'Cart',
      },
      {
        path: 'wishList',
        loadComponent: () =>
          import('./Components/wishlist/wishlist.component').then(
            (c) => c.WishlistComponent
          ),
        title: 'Wish List',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./Components/products/products.component').then(
            (c) => c.ProductsComponent
          ),
        title: 'All Products',
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./Components/categories/categories.component').then(
            (c) => c.CategoriesComponent
          ),
        title: 'All Categories',
      },
      {
        path: 'allOrders',
        loadComponent: () =>
          import('./Components/all-orders/all-orders.component').then(
            (c) => c.AllOrdersComponent
          ),
        title: 'All Orders',
      },
      {
        path: 'details/:id',
        loadComponent: () =>
          import('./Components/product-details/product-details.component').then(
            (c) => c.ProductDetailsComponent
          ),
        title: 'Item Details',
      },
      {
        path: 'catDetails/:code',
        loadComponent: () =>
          import(
            './Components/category-details/category-details.component'
          ).then((c) => c.CategoryDetailsComponent),
        title: 'Category Products',
      },
      {
        path: 'offers',
        loadComponent: () =>
          import('./Components/offers/offers.component').then(
            (c) => c.OffersComponent
          ),
        title: 'Offers',
      },
    ],
  },

  // Not Found
  {
    path: '**',
    loadComponent: () =>
      import('./Components/notfound/notfound.component').then(
        (c) => c.NotfoundComponent
      ),
  },
];
