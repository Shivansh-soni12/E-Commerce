import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderMgmt } from '../../../services/order-mgmt'; // Verify this path
import { Router } from '@angular/router';
import { UserService } from '../../../services/user-service'; // To get the loggedInUser
import { Subscription } from 'rxjs';
import { CartService } from '../../../services/cart.service'; // To clear the cart after order

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.html',
  styleUrls: ['./order-summary.css']
})
export class OrderSummary {
  @Input() cart: any[] = []; 

  loggedInUser: any = null;
  private userSub!: Subscription;

  constructor(
    private orderMgmt: OrderMgmt,
    private router: Router,
    private userService: UserService,
    private cartService: CartService
  ) {}

ngOnInit() {
    // Correct way to get the user from your UserService
    this.userSub = this.userService.currentUser$.subscribe(user => {
      this.loggedInUser = user;
    });
  }


  get cartItems() {
    return this.cart || [];
  }

  getIndividualTotal(item: any): number {
    return (item.price || 0) * (item.quantity || 0);
  }

  getOriginalTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.getIndividualTotal(item), 0);
  }

  getDeliveryCharges(): number {
    const total = this.getOriginalTotal();
    return (total >= 2000 || total === 0) ? 0 : 50;
  }

  getTotalSavings(): number {
    return 0; 
  }

  getGrandTotal(): number {
    return this.getOriginalTotal() + this.getDeliveryCharges() - this.getTotalSavings();
  }

  // --- THE FIX IS HERE ---
proceedOrder() {
    console.log("Attempting checkout with items:", this.cartItems);

    const userId = this.loggedInUser?._id || this.loggedInUser?.id;

    if (!userId) {
      alert("Please log in to place an order.");
      this.router.navigate(['/login']);
      return;
    }

    console.log("Triggering Network Request for User:", userId);

    // This is the line that will make the POST show up in the Network tab
 // order-summary.ts -> proceedOrder() function

this.orderMgmt.placeOrder(String(userId)).subscribe({
  next: (res) => {
    console.log("ORDER SUCCESSFUL:", res);
    
    // 1. Clear the local CartService state immediately
    this.cartService.setCart([]); 

    // 2. If your UserService keeps a copy of the user, update it too
    if (this.loggedInUser) {
      this.loggedInUser.cart = [];
      // This tells other components (like the Navbar badge) that the cart is now empty
      this.userService['updateLocalUser'](this.loggedInUser); 
    }

    alert("Order Placed Successfully!");
    this.router.navigate(['/orders/dashboard']);
  },
  error: (err) => {
    console.error("ORDER FAILED:", err);
  }
});
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}