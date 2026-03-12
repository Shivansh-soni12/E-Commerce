import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; 
import { LoginForm } from '../login-form/login-form';
import { RegisterForm } from '../register-form/register-form';
import { UserService } from '../../../services/user-service';
import { User } from '../../../models/user';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    LoginForm,
    RegisterForm
  ],
  templateUrl: './auth-page.html',
  styleUrls: ['./auth-page.css'],
})
export class AuthPage implements OnInit {
  staticMessage: string = 'Welcome to the E-Commerce Portal!';
  showLogin: boolean = true;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute // Added to detect URL
  ) {}

  ngOnInit() {
    // Logic: Check URL on load. If path is 'register', show register form.
    this.route.url.subscribe(url => {
      this.showLogin = !url.some(segment => segment.path === 'register');
    });
  }

  toggleForm() {
    if (this.showLogin) {
      this.router.navigate(['/register']);
    } else {
      this.router.navigate(['/login']);
    }
  }

// onLoginSuccess(user: User) {
//   // If this logs 'undefined', check your Node.js res.json() call
//   console.log('Redirecting user:', user.name, 'with Role:', user.role);

//   if (user.role === 'admin') {
//     // Navigate to the parent admin route
//     this.router.navigate(['/admin/products']); 
//   } else {
// this.router.navigate(['/home']).then(() => {
//        // Optional: Force a small scroll or check to ensure UI refreshed
//        window.scrollTo(0,0);
//     });  }
// }
// Inside auth-page.ts
onLoginSuccess(user: User) {
  console.log('Redirecting user:', user.name, 'Role:', user.role);

  // Use setTimeout to ensure the AuthGuard sees the updated UserService state
  setTimeout(() => {
    if (user.role === 'admin') {
      this.router.navigate(['/admin/products']).then(nav => {
        if(!nav) console.error('Navigation to Admin failed - check your Guard!');
      });
    } else {
      this.router.navigate(['/home']);
    }
  }, 100); // 100ms is enough to bridge the gap
}
}