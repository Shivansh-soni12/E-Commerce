import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user-service';
import { User } from '../../../models/user';

@Component({
  selector: 'app-login-form',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.css']
})
export class LoginForm {
  @Input() welcome: string = '';
  @Output() loginSuccess = new EventEmitter<User>();

  email: string = '';
  password: string = '';

  constructor(private userService: UserService) {}

  processLogin(form: any) {
    if (form.valid) {
      this.userService.login({ email: this.email, password: this.password }).subscribe({
        next: (res: any) => {
          console.log('Login successful, emitting to parent...');
          this.loginSuccess.emit(res); 
        },
        error: (err) => {
          alert(err.error?.message || 'Login Failed');
        }
      });
    }
  }
}