import { Component,OnInit,OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderMgmt } from '../../../services/order-mgmt';
import { UserService } from '../../../services/user-service';
import { CartService } from '../../../services/cart.service';
import { Subscription } from 'rxjs';
import { AbstractControl, ValidationErrors } from '@angular/forms';
@Component({
  selector: 'app-payment',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})

export class Payment implements OnInit, OnDestroy{
paymentForm!: FormGroup;
  paymentAmount: number = 0;
  cartItems: any[] = [];
  isProcessing: boolean = false;
  
  loggedInUser: any = null;
  private userSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private orderMgmt: OrderMgmt,
    private userService: UserService,
    private cartService: CartService
  ) {
   
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { amount: number, cart: any[] };
    
    if (state && state.amount > 0) {
      this.paymentAmount = state.amount;
      this.cartItems = state.cart;
    } else {

      this.router.navigate(['/cart']); 
    }
  }
  
  ngOnInit() {
    this.userSub = this.userService.currentUser$.subscribe(user => {
      this.loggedInUser = user;
    });

    this.paymentForm = this.fb.group({
      nameOnCard: ['', [Validators.required,Validators.pattern('^[a-zA-Z ]*$')]],
      cardNumber: ['', [Validators.required, Validators.pattern('^([0-9]{4} ){3}[0-9]{4}$')]],
      expiry: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$'),expiryValidator]], // MM/YY format(expiryValidator function customvalidator used here)
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
    });
  }

  processMockPayment() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isProcessing = true;
    setTimeout(() => {
      this.finalizeOrder();
    }, 2000);
  }

  finalizeOrder() {
    const userId = this.loggedInUser?._id || this.loggedInUser?.id;

    if (!userId) {
      alert("Please log in to place an order.");
      this.router.navigate(['/login']);
      return;
    }

    this.orderMgmt.placeOrder(String(userId)).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.cartService.setCart([]);

        if (this.loggedInUser) {
          this.loggedInUser.cart = [];
          this.userService['updateLocalUser'](this.loggedInUser);
        }

        alert("Payment Successful! Order Placed.");
        this.router.navigate(['/orders/dashboard']);
      },
      error: (err) => {
        this.isProcessing = false;
        console.error("ORDER FAILED:", err);
        alert("Payment failed. Please try again.");
      }
    });
  }
restrictToNumbers(event: KeyboardEvent) {
  const isDigit = /^[0-9]$/.test(event.key);
  const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key);
  if (!isDigit && !isControlKey) {
    event.preventDefault();
  }
}

formatCardNumber(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '');

  if (value.length > 16) {
    value = value.substring(0, 16);
  }
  const parts = value.match(/.{1,4}/g);
  const formattedValue = parts ? parts.join(' ') : value;
  this.paymentForm.get('cardNumber')?.setValue(formattedValue, { emitEvent: false });
}

formatExpiry(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, ''); 

  if (value.length > 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  
  input.value = value;
  this.paymentForm.get('expiry')?.setValue(value, { emitEvent: false });
}
  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}

export function expiryValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value || !value.includes('/')) return { invalidExpiry: true };

  const [month, year] = value.split('/').map((v: string) => parseInt(v, 10));
  
  if (isNaN(month) || isNaN(year)) return { invalidExpiry: true };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = parseInt(now.getFullYear().toString().slice(-2), 10);

  if (month < 1 || month > 12) return { invalidExpiry: true };

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { pastDate: true };
  }

  return null;
}
