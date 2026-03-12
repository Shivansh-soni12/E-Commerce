import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../services/user-service';
import { map, take, filter } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  return userService.currentUser$.pipe(
    take(1), 
    map(user => {
      if (user) {
        return true;
      } else {
        console.warn("AuthGuard: No user found, redirecting to login.");
        router.navigate(['/login']);
        return false;
      }
    })
  );
};