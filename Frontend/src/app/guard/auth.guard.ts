import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service'; 

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  // Check if the RAM variable exists
  const token = userService.getToken();

  if (token) {
    return true; 
  }
  
  // LOGGING FOR DEBUGGING
  console.error('AuthGuard: Access denied for this tab. Redirecting to login.');
  
  router.navigate(['/login']);
  return false;
};