import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service'; 

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  if (userService.getLoggedUserId()) {
  }
    return true; 
  inject(Router).navigate(['/login']);
  return false;
};