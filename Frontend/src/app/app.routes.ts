import { Routes, Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { map, take, filter } from 'rxjs';
import { HeroPage } from './components/dashboard/hero/hero';
import { UserService } from './services/user-service';

export const authGuard: CanActivateFn = (route) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.currentUser$.pipe(
    
    take(1), 
    map(user => {
     
      if (!user) {
        console.log('Guard: No user found, redirecting to login');
        router.navigate(['/login']);
        return false;
      }
      const path = route.routeConfig?.path || '';
      const isAdminRoute = path.includes('admin') || route.parent?.routeConfig?.path?.includes('admin');
      
      if (isAdminRoute && user.role !== 'admin') {
        alert("Unauthorized: Admin Access Only");
        router.navigate(['/home']);
        return false;
      }

      return true;
    })
  );
};

export const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HeroPage },


  {
    path: 'login',
    loadComponent: () => import('./components/LoginRegister/auth-page/auth-page').then(m => m.AuthPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/LoginRegister/register-form/register-form').then(m => m.RegisterForm),
  },

 
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./components/LoginRegister/profile-dashboard/profile-dashboard').then(m => m.ProfileDashboard),
  },


  {
    path: 'cart',
    loadComponent: () => import('./components/Add-Cart/main-cart/main-cart').then(m => m.MainCart),
  },

   {
  path: 'orders',
  canActivate: [authGuard],
  loadComponent: () => import('./components/order-mgmt/order-main/order-main').then(m => m.OrderMain),
  children: [
    { path: '', redirectTo: 'history', pathMatch: 'full' },
    {
      path: 'history',
      loadComponent: () => import('./components/order-mgmt/order-list/order-list').then(m => m.OrderList),
    },
    {
      path: 'detail/:id',
      loadComponent: () => import('./components/order-mgmt/order-detail/order-detail').then(m => m.OrderDetail),
    },
  ],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./components/admin-dashboard/admin-main/admin-main').then(m => m.AdminMain),
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        loadComponent: () => import('./components/admin-dashboard/view-product/view-product').then(m => m.ViewProduct),
      },
      {
        path: 'add',
        loadComponent: () => import('./components/admin-dashboard/add-product/add-product').then(m => m.AddProduct),
      },
      {
        path: 'manage',
        loadComponent: () => import('./components/admin-dashboard/edit-product/edit-product').then(m => m.Editproduct),
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/admin-dashboard/editformcomponent/editformcomponent').then(m => m.Editformcomponent),
      },
    ],
  },

  { path: '**', redirectTo: 'home' },
];