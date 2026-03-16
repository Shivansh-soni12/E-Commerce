import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user-service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-register-form',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './register-form.html',
  styleUrls: ['./register-form.css']
})
export class RegisterForm {
  @Input() welcome: string = '';

  name: string = '';
  email: string = '';
  password: string = '';
  shippingAddress: string = '';
  paymentDetails: string = '';

  constructor(
    private userService: UserService,
    private router: Router  
  ) {}

  processRegister(form: any) {
    if (form.valid) {
      
      const newUser: any = {
        name: this.name,
        email: this.email,
        password: this.password,
        shippingAddress: this.shippingAddress,
        paymentDetails: this.paymentDetails,
        role: 'user'
      };

      
      this.userService.register(newUser).subscribe({
        next: (response: any) => {
          
          alert('User Registered Successfully in Database!');
          this.router.navigate(['/login']);
        },
        error: (err: { error: { message: string; }; }) => {
         
          console.error('Registration Error:', err);
          const errorMsg = err.error?.message || 'Registration failed. Try again.';
          alert(errorMsg);
          
          if (errorMsg.includes('exists')) {
             this.router.navigate(['/login']);
          }
        }
      });
    }
  }
}