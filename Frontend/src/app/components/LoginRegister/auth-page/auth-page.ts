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
    private route: ActivatedRoute 
  ) {}

  ngOnInit() {
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

onLoginSuccess(user: User) {
  console.log('Redirecting user:', user.name, 'Role:', user.role);

  setTimeout(() => {
    if (user.role === 'admin') {
      this.router.navigate(['/admin/products']).then(nav => {
        if(!nav) console.error('Navigation to Admin failed - check your Guard!');
      });
    } else {
      this.router.navigate(['/home']);
    }
  }, 100);
}
}